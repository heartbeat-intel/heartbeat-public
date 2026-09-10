import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SubscribeModal from '../SubscribeModal';
import { EXCHANGE_TOKEN_STORAGE_KEY } from '../../../utils/subscribeModalCopy';

// @iconify/react v5 fetches icon data on mount; nothing here looks at an icon.
vi.mock('@iconify/react', () => ({ Icon: () => null }));

/** True when `b` comes after `a` in document order. */
const isAfter = (a: HTMLElement, b: HTMLElement) =>
  !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

// window.location is replaced per test so the checkout redirect can be
// observed (jsdom would otherwise log "Not implemented: navigation").
const mockLocationHref = vi.fn();

type ModalProps = ComponentProps<typeof SubscribeModal>;
type User = ReturnType<typeof userEvent.setup>;

const defaultProps: ModalProps = {
  isOpen: true,
  onClose: () => {},
  publisherName: 'Diego Alcaino',
  publisherId: 'test-publisher-id',
  monthlyPriceCents: 2900, // $29/month
  yearlyPriceCents: 24900, // $249/year
};

const renderModal = (props: Partial<ModalProps> = {}) => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const utils = render(<SubscribeModal {...defaultProps} onClose={onClose} {...props} />);
  return { user, onClose, ...utils };
};

const jsonResponse = (body: unknown, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) });
const codeSent = () => jsonResponse({ is_new_user: false, email: 'test@example.com' });

/** Answers the paid path; free-subscribe fails so a paid signup that drifts onto the free path fails here. */
const createPaidMockFetch = (checkoutUrl = 'https://checkout.stripe.com/test') =>
  vi.fn().mockImplementation((url: string) => {
    if (url.includes('/subscribe-init')) return codeSent();
    if (url.includes('/subscribe-verify')) return jsonResponse({ access_token: 'verified-token-123' });
    if (url.includes('/payments/checkout')) return jsonResponse({ checkout_url: checkoutUrl });
    if (url.includes('/payments/free-subscribe')) {
      return jsonResponse({ detail: 'free-subscribe is not part of the paid path' }, false);
    }
    return jsonResponse({});
  });

/** Answers the free path; checkout fails so a free signup that drifts onto Stripe fails here. */
const createFreeMockFetch = (freeSubscribe: () => Promise<unknown> = () => jsonResponse({})) =>
  vi.fn().mockImplementation((url: string) => {
    if (url.includes('/subscribe-init')) return jsonResponse({ is_new_user: true, email: 'test@example.com' });
    if (url.includes('/subscribe-verify')) return jsonResponse({ access_token: 'verified-token-123' });
    if (url.includes('/payments/free-subscribe')) return freeSubscribe();
    if (url.includes('/payments/checkout')) {
      return jsonResponse({ detail: 'checkout is not part of the free path' }, false);
    }
    return jsonResponse({});
  });

const callsTo = (mockFetch: ReturnType<typeof vi.fn>, path: string) =>
  mockFetch.mock.calls.filter((call) => (call[0] as string).includes(path));

const goToEmail = async (user: User) => {
  await user.click(screen.getByTestId('continue-button'));
  await waitFor(() => {
    expect(screen.getByTestId('email-step')).toBeInTheDocument();
  });
};

const goToVerify = async (user: User) => {
  await goToEmail(user);
  await user.type(screen.getByTestId('email-input'), 'test@example.com');
  await user.click(screen.getByTestId('continue-email'));
  await waitFor(() => {
    expect(screen.getByTestId('verify-step')).toBeInTheDocument();
  });
};

const typeCode = async (user: User, digits: string) => {
  for (let i = 0; i < digits.length; i++) {
    await user.type(screen.getByTestId(`code-input-${i + 1}`), digits[i]);
  }
};

/** Lets the OTP auto-submit timer (OTP_AUTOSUBMIT_DELAY_MS) fire inside the test that armed it. */
const settleAutoSubmit = () => new Promise((resolve) => setTimeout(resolve, 150));

describe('SubscribeModal (Exchange)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('location', {
      set href(url: string) {
        mockLocationHref(url);
      },
      get href() {
        return '';
      },
    });
    localStorage.clear();
  });

  it('renders nothing while closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByTestId('subscribe-modal')).not.toBeInTheDocument();
  });

  describe('Pricing Step', () => {
    it('orders the cards Monthly, Yearly, Get invite with monthly preselected', () => {
      // The order is the cross-host contract (TIER_ORDER); the tenant modal
      // asserts the same thing. Monthly preselected is A8: the apex used to
      // default to yearly.
      renderModal({ freeTierEnabled: true });

      expect(screen.getByTestId('pricing-step')).toBeInTheDocument();
      const monthly = screen.getByTestId('tier-monthly');
      const yearly = screen.getByTestId('tier-yearly');
      const free = screen.getByTestId('tier-free');
      expect(isAfter(monthly, yearly)).toBe(true);
      expect(isAfter(yearly, free)).toBe(true);
      expect(monthly).toHaveTextContent('Monthly');
      expect(yearly).toHaveTextContent('Yearly');
      expect(free).toHaveTextContent('Get invite');
      expect(screen.getByTestId('continue-button')).toHaveTextContent('Subscribe for $29/month');
    });

    it('marks the yearly card BEST VALUE with its per-month price and savings', () => {
      renderModal();

      const yearly = screen.getByTestId('tier-yearly');
      expect(yearly).toHaveTextContent('BEST VALUE');
      expect(yearly).toHaveTextContent('$249');
      expect(yearly).toHaveTextContent('$20.75/month'); // 24900 / 100 / 12
      expect(yearly).toHaveTextContent('Save $99'); // 29 * 12 - 249
      expect(screen.getByTestId('tier-monthly')).not.toHaveTextContent('BEST VALUE');
    });

    it('labels the free tier "Get invite" over "Free", not "$0"', () => {
      renderModal({ freeTierEnabled: true });

      expect(screen.getByTestId('tier-free')).toHaveTextContent('Free');
      expect(screen.queryByText('$0')).not.toBeInTheDocument();
    });

    it('hides Get invite unless the publisher enabled the free tier', () => {
      renderModal();
      expect(screen.queryByTestId('tier-free')).not.toBeInTheDocument();
    });

    it('titles the step with the publisher and no subtitle', () => {
      // This modal used to add "Get full access to …'s curated intelligence"
      // under the title; the tenant layout is the target for both hosts.
      renderModal();

      const title = screen.getByText('Subscribe to Diego Alcaino');
      expect(title.nextElementSibling).toBeNull();
      expect(screen.queryByText(/curated intelligence/)).not.toBeInTheDocument();
    });

    it('renders the publisher logo when one is supplied', () => {
      renderModal({ publisherLogoUrl: 'https://cdn.example.com/logo.png' });

      expect(screen.getByAltText('Diego Alcaino')).toHaveAttribute('src', 'https://cdn.example.com/logo.png');
      expect(screen.getByTestId('publisher-avatar')).toBeInTheDocument();
    });

    it('honours billing options and defaults to the first tier when monthly is off', () => {
      renderModal({ billingOptions: 'yearly_only' });

      expect(screen.queryByTestId('tier-monthly')).not.toBeInTheDocument();
      expect(screen.getByTestId('tier-yearly')).toBeInTheDocument();
      expect(screen.getByTestId('continue-button')).toHaveTextContent('Subscribe for $249/year');
    });

    it('switches the CTA price with the selected tier', async () => {
      const { user } = renderModal();

      await user.click(screen.getByTestId('tier-yearly'));
      expect(screen.getByTestId('continue-button')).toHaveTextContent('Subscribe for $249/year');

      await user.click(screen.getByTestId('tier-monthly'));
      expect(screen.getByTestId('continue-button')).toHaveTextContent('Subscribe for $29/month');
    });

    it('shows the paid bullets, and the free bullets for Get invite', async () => {
      const { user } = renderModal({ freeTierEnabled: true });

      expect(screen.getByText('Full access to all intel lists')).toBeInTheDocument();
      expect(screen.getByText('2 months free')).toBeInTheDocument();

      await user.click(screen.getByTestId('tier-free'));
      expect(screen.getByText('Access to free releases')).toBeInTheDocument();
      expect(screen.getByText('No credit card required')).toBeInTheDocument();
      expect(screen.queryByText('Full access to all intel lists')).not.toBeInTheDocument();
    });

    it('renders publisher-authored value props instead of the defaults', () => {
      renderModal({ valueProps: { paid: ['Weekly deal flow', 'Founder intros'] } });

      expect(screen.getByText('Weekly deal flow')).toBeInTheDocument();
      expect(screen.getByText('Founder intros')).toBeInTheDocument();
      expect(screen.queryByText('Priority support')).not.toBeInTheDocument();
    });

    it('displays the step indicator with Payment as the last step', () => {
      renderModal();

      expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('step-1-active')).toBeInTheDocument();
      expect(screen.getByText('Choose Plan')).toBeInTheDocument();
      expect(screen.getByText('Verify Email')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
    });

    it('relabels step 3 as Access for the free tier and Payment again for a paid one', async () => {
      const { user } = renderModal({ freeTierEnabled: true });

      expect(screen.getByText('Payment')).toBeInTheDocument();

      await user.click(screen.getByTestId('tier-free'));
      expect(screen.getByText('Access')).toBeInTheDocument();
      expect(screen.queryByText('Payment')).not.toBeInTheDocument();

      await user.click(screen.getByTestId('tier-monthly'));
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.queryByText('Access')).not.toBeInTheDocument();
    });

    it('offers Get Free Access without the Stripe footer', async () => {
      const { user } = renderModal({ freeTierEnabled: true });

      // Paid default: Stripe footer is up
      expect(screen.getByText(/Secure checkout powered by Stripe/)).toBeInTheDocument();

      await user.click(screen.getByTestId('tier-free'));

      expect(screen.getByTestId('continue-button')).toHaveTextContent('Get Free Access');
      expect(screen.queryByText(/Secure checkout powered by Stripe/)).not.toBeInTheDocument();
    });

    it('shows Contact for Pricing when the publisher has no pricing', () => {
      renderModal({ monthlyPriceCents: 0, yearlyPriceCents: 0 });

      expect(screen.getByTestId('no-pricing-step')).toBeInTheDocument();
      expect(screen.getByText('Contact for Pricing')).toBeInTheDocument();
      expect(screen.getByText('Reach out to Diego Alcaino to discuss subscription options.')).toBeInTheDocument();
      expect(screen.queryByTestId('continue-button')).not.toBeInTheDocument();
    });

    it('shows the missing-publisher error inline and stays on pricing', async () => {
      const { user } = renderModal({ publisherId: undefined });

      await user.click(screen.getByTestId('continue-button'));

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Unable to identify publisher. Please refresh and try again.'
      );
      expect(screen.getByTestId('pricing-step')).toBeInTheDocument();
      expect(screen.queryByTestId('email-step')).not.toBeInTheDocument();
    });
  });

  describe('Email Step', () => {
    it('shows the plan summary, the labelled input and both footnotes', async () => {
      const { user } = renderModal();
      await goToEmail(user);

      expect(screen.getByTestId('plan-summary')).toBeInTheDocument();
      expect(screen.getByText('YOUR PLAN')).toBeInTheDocument();
      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('$29/month')).toBeInTheDocument();
      expect(screen.getByText("Full access to Diego Alcaino's intel")).toBeInTheDocument();

      expect(screen.getByLabelText('Email Address')).toBe(screen.getByTestId('email-input'));
      expect(screen.getByTestId('email-input')).toHaveAttribute('placeholder', 'you@example.com');
      expect(screen.getByTestId('continue-email')).toHaveTextContent('Continue with Email');
      expect(screen.getByText("We'll create an account for you if you don't have one")).toBeInTheDocument();
      expect(screen.getByText('No password needed - we use secure magic links')).toBeInTheDocument();

      expect(screen.getByTestId('step-2-active')).toBeInTheDocument();
      expect(screen.getByTestId('step-1-completed')).toBeInTheDocument();
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('validates that an email is provided', async () => {
      const { user } = renderModal();
      await goToEmail(user);

      await user.click(screen.getByTestId('continue-email'));

      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter your email');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('sends subscribe-init with the selected tier and moves to the verify step', async () => {
      const mockFetch = vi.fn().mockImplementation(codeSent);
      vi.stubGlobal('fetch', mockFetch);

      const { user } = renderModal();
      await goToVerify(user);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/subscribe-init'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', publisher_id: 'test-publisher-id', tier: 'monthly' }),
        })
      );
      expect(screen.getByText('Check your inbox for test@example.com')).toBeInTheDocument();
    });

    it('submits the email form on Enter', async () => {
      const mockFetch = vi.fn().mockImplementation(codeSent);
      vi.stubGlobal('fetch', mockFetch);

      const { user } = renderModal();
      await goToEmail(user);

      await user.type(screen.getByTestId('email-input'), 'test@example.com{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('verify-step')).toBeInTheDocument();
      });
      expect(callsTo(mockFetch, '/subscribe-init')).toHaveLength(1);
    });

    it('surfaces the API error when the code cannot be sent', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(() => jsonResponse({ detail: 'Too many requests' }, false))
      );

      const { user } = renderModal();
      await goToEmail(user);
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('continue-email'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Too many requests');
      });
      expect(screen.getByTestId('email-step')).toBeInTheDocument();
    });

    it('navigates back to the pricing step', async () => {
      const { user } = renderModal();
      await goToEmail(user);

      await user.click(screen.getByTestId('back-button'));

      expect(screen.getByTestId('pricing-step')).toBeInTheDocument();
      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
    });
  });

  describe('Verification Step', () => {
    it('renders six boxes and a verify button disabled until every digit is in', async () => {
      // A full paid mock: the sixth digit arms the auto-submit, and waiting
      // for its redirect keeps every state update inside act().
      vi.stubGlobal('fetch', createPaidMockFetch());
      const { user } = renderModal();
      await goToVerify(user);

      for (let i = 1; i <= 6; i++) {
        expect(screen.getByTestId(`code-input-${i}`)).toHaveAttribute('inputmode', 'numeric');
      }
      expect(screen.getByTestId('code-input-1')).toHaveAttribute('autocomplete', 'one-time-code');
      expect(screen.getByRole('group', { name: 'Verification Code' })).toBeInTheDocument();
      expect(screen.getByTestId('plan-summary')).toBeInTheDocument();
      expect(screen.getByTestId('step-2-active')).toBeInTheDocument();

      const verifyButton = screen.getByTestId('verify-button');
      expect(verifyButton).toHaveTextContent('Verify & Continue to Payment');
      expect(verifyButton).toBeDisabled();

      // Five digits is still not a code
      await typeCode(user, '12345');
      expect(screen.getByTestId('verify-button')).toBeDisabled();

      await user.type(screen.getByTestId('code-input-6'), '6');
      expect(screen.getByTestId('verify-button')).not.toBeDisabled();

      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith('https://checkout.stripe.com/test');
      });
    });

    it('auto-advances, and Backspace on an empty box clears the previous one', async () => {
      vi.stubGlobal('fetch', vi.fn().mockImplementation(codeSent));
      const { user } = renderModal();
      await goToVerify(user);

      await user.click(screen.getByTestId('code-input-1'));
      await user.keyboard('12');

      expect(screen.getByTestId('code-input-1')).toHaveValue('1');
      expect(screen.getByTestId('code-input-2')).toHaveValue('2');
      expect(screen.getByTestId('code-input-3')).toHaveFocus();

      await user.keyboard('{Backspace}');

      expect(screen.getByTestId('code-input-2')).toHaveValue('');
      expect(screen.getByTestId('code-input-2')).toHaveFocus();
      expect(screen.getByTestId('code-input-1')).toHaveValue('1');

      // A non-digit typed over a filled box is rejected, not a clear
      await user.type(screen.getByTestId('code-input-1'), 'x', { initialSelectionStart: 0, initialSelectionEnd: 1 });
      expect(screen.getByTestId('code-input-1')).toHaveValue('1');
    });

    it('spreads a pasted code across the boxes and auto-submits it', async () => {
      const mockFetch = createPaidMockFetch();
      vi.stubGlobal('fetch', mockFetch);
      const { user } = renderModal();
      await goToVerify(user);

      await user.click(screen.getByTestId('code-input-1'));
      await user.paste('123456');

      for (let i = 1; i <= 6; i++) {
        expect(screen.getByTestId(`code-input-${i}`)).toHaveValue(String(i));
      }

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/auth/subscribe-verify'),
          expect.objectContaining({ body: JSON.stringify({ email: 'test@example.com', code: '123456' }) })
        );
      });
      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith('https://checkout.stripe.com/test');
      });
    });

    it('shows the invalid-code error', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/subscribe-verify')) return jsonResponse({ detail: 'Invalid or expired code' }, false);
        return codeSent();
      });
      vi.stubGlobal('fetch', mockFetch);

      const { user } = renderModal();
      await goToVerify(user);
      await typeCode(user, '123456');

      await waitFor(() => {
        expect(screen.getByTestId('verify-error-message')).toHaveTextContent('Invalid or expired code');
      });
      expect(screen.getByTestId('verify-button')).not.toBeDisabled();
      expect(mockLocationHref).not.toHaveBeenCalled();

      await settleAutoSubmit();
    });

    it('resends the code and clears the boxes', async () => {
      const mockFetch = vi.fn().mockImplementation(codeSent);
      vi.stubGlobal('fetch', mockFetch);
      const { user } = renderModal();
      await goToVerify(user);
      await typeCode(user, '123');

      expect(screen.getByText("Didn't receive it?")).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Resend code' }));

      await waitFor(() => {
        expect(callsTo(mockFetch, '/subscribe-init')).toHaveLength(2);
      });
      expect(screen.getByTestId('code-input-1')).toHaveValue('');
      expect(screen.getByTestId('code-input-3')).toHaveValue('');
      expect(screen.getByTestId('verify-step')).toBeInTheDocument();
    });

    it('navigates back to the email step', async () => {
      vi.stubGlobal('fetch', vi.fn().mockImplementation(codeSent));
      const { user } = renderModal();
      await goToVerify(user);

      await user.click(screen.getByTestId('back-button'));

      expect(screen.getByTestId('email-step')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toHaveValue('test@example.com');
    });

    it('auto-fills and verifies a dev_code from subscribe-init', async () => {
      const mockFetch = createPaidMockFetch();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/subscribe-init')) return jsonResponse({ is_new_user: false, dev_code: '654321' });
        if (url.includes('/subscribe-verify')) return jsonResponse({ access_token: 'verified-token-123' });
        if (url.includes('/payments/checkout')) return jsonResponse({ checkout_url: 'https://checkout.stripe.com/dev' });
        return jsonResponse({});
      });
      vi.stubGlobal('fetch', mockFetch);
      const { user } = renderModal();
      await goToVerify(user);

      expect(screen.getByTestId('code-input-1')).toHaveValue('6');
      expect(screen.getByTestId('code-input-6')).toHaveValue('1');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/auth/subscribe-verify'),
          expect.objectContaining({ body: JSON.stringify({ email: 'test@example.com', code: '654321' }) })
        );
      });
      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith('https://checkout.stripe.com/dev');
      });
    });
  });

  describe('Paid path', () => {
    it('stores the token, creates checkout with Bearer and no return_url, and redirects', async () => {
      const mockFetch = createPaidMockFetch('https://checkout.stripe.com/session123');
      vi.stubGlobal('fetch', mockFetch);

      const { user } = renderModal({ publisherId: '550e8400-e29b-41d4-a716-446655440000' });
      await goToVerify(user);
      await typeCode(user, '123456');

      await waitFor(() => {
        expect(screen.getByTestId('verify-button')).not.toBeDisabled();
      });
      await user.click(screen.getByTestId('verify-button'));

      await waitFor(() => {
        expect(callsTo(mockFetch, '/payments/checkout').length).toBeGreaterThan(0);
      });
      const [, checkoutInit] = callsTo(mockFetch, '/payments/checkout')[0];
      expect(checkoutInit.method).toBe('POST');
      expect(checkoutInit.headers.Authorization).toBe('Bearer verified-token-123');
      // No return_url on the apex: Exchange already returns to the tenant's
      // checkout pages.
      expect(JSON.parse(checkoutInit.body)).toEqual({
        publisher_id: '550e8400-e29b-41d4-a716-446655440000',
        price_type: 'monthly',
      });

      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith('https://checkout.stripe.com/session123');
      });
      expect(localStorage.getItem(EXCHANGE_TOKEN_STORAGE_KEY)).toBe('verified-token-123');
      expect(localStorage.getItem('hb_account_email')).toBe('test@example.com');
      expect(callsTo(mockFetch, '/payments/free-subscribe')).toHaveLength(0);

      // The auto-submit timer and the click both fired for this one code:
      // one verify call and one checkout session, not two.
      await settleAutoSubmit();
      expect(callsTo(mockFetch, '/subscribe-verify')).toHaveLength(1);
      expect(callsTo(mockFetch, '/payments/checkout')).toHaveLength(1);
    });

    it('sends the selected price_type when yearly is chosen', async () => {
      const mockFetch = createPaidMockFetch();
      vi.stubGlobal('fetch', mockFetch);

      const { user } = renderModal();
      await user.click(screen.getByTestId('tier-yearly'));
      await goToVerify(user);
      await typeCode(user, '123456');

      await waitFor(() => {
        expect(callsTo(mockFetch, '/payments/checkout').length).toBeGreaterThan(0);
      });
      expect(JSON.parse(callsTo(mockFetch, '/payments/checkout')[0][1].body).price_type).toBe('yearly');
      expect(JSON.parse(callsTo(mockFetch, '/subscribe-init')[0][1].body).tier).toBe('yearly');

      await settleAutoSubmit();
      expect(callsTo(mockFetch, '/subscribe-verify')).toHaveLength(1);
      expect(callsTo(mockFetch, '/payments/checkout')).toHaveLength(1);
    });

    it('shows Redirecting to checkout... while the session is created', async () => {
      // checkout never resolves, so the button stays in its loading state
      const mockFetch = createPaidMockFetch();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/subscribe-init')) return codeSent();
        if (url.includes('/subscribe-verify')) return jsonResponse({ access_token: 'verified-token-123' });
        return new Promise(() => {});
      });
      vi.stubGlobal('fetch', mockFetch);

      const { user } = renderModal();
      await goToVerify(user);
      await typeCode(user, '123456');

      await waitFor(() => {
        expect(screen.getByTestId('verify-button')).toHaveTextContent('Redirecting to checkout...');
      });
      expect(screen.getByTestId('verify-button')).toBeDisabled();

      await settleAutoSubmit();
    });

    it('surfaces a checkout failure and stays on the verify step', async () => {
      const mockFetch = createPaidMockFetch();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/subscribe-init')) return codeSent();
        if (url.includes('/subscribe-verify')) return jsonResponse({ access_token: 'verified-token-123' });
        if (url.includes('/payments/checkout')) return jsonResponse({ detail: 'Card declined' }, false);
        return jsonResponse({});
      });
      vi.stubGlobal('fetch', mockFetch);

      const { user } = renderModal();
      await goToVerify(user);
      await typeCode(user, '123456');

      await waitFor(() => {
        expect(screen.getByTestId('verify-error-message')).toHaveTextContent('Card declined');
      });
      expect(mockLocationHref).not.toHaveBeenCalled();

      await settleAutoSubmit();
    });
  });

  describe('Free tier (Get invite)', () => {
    const renderFree = () => renderModal({ freeTierEnabled: true });

    // Select Get invite, continue, send the code, land on the verify step.
    const goToVerifyAsFree = async (user: User) => {
      await user.click(screen.getByTestId('tier-free'));
      await waitFor(() => {
        expect(screen.getByTestId('continue-button')).toHaveTextContent('Get Free Access');
      });
      await goToVerify(user);
    };

    it('summarises the free plan as access to the free releases', async () => {
      const { user } = renderFree();

      await user.click(screen.getByTestId('tier-free'));
      await goToEmail(user);

      expect(screen.getByTestId('plan-summary')).toHaveTextContent('Get invite');
      expect(screen.getByTestId('plan-summary')).toHaveTextContent('Free');
      expect(screen.getByText("Access to Diego Alcaino's free releases")).toBeInTheDocument();
      expect(screen.queryByText("Full access to Diego Alcaino's intel")).not.toBeInTheDocument();
      expect(screen.getByText('Access')).toBeInTheDocument();
    });

    it('sends tier free and reads Verify & Get Access, disabled until all 6 digits', async () => {
      const mockFetch = createFreeMockFetch();
      vi.stubGlobal('fetch', mockFetch);

      const { user } = renderFree();
      await goToVerifyAsFree(user);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/subscribe-init'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', publisher_id: 'test-publisher-id', tier: 'free' }),
        })
      );

      const verifyButton = screen.getByTestId('verify-button');
      expect(verifyButton).toHaveTextContent('Verify & Get Access');
      expect(verifyButton).toBeDisabled();

      // Five digits is still not a code
      await typeCode(user, '12345');
      expect(screen.getByTestId('verify-button')).toBeDisabled();
    });

    it('shows Activating access... while the free subscription is created', async () => {
      // free-subscribe never resolves, so the button stays in its loading state
      const mockFetch = createFreeMockFetch(() => new Promise(() => {}));
      vi.stubGlobal('fetch', mockFetch);

      const { user } = renderFree();
      await goToVerifyAsFree(user);
      await typeCode(user, '123456');

      await waitFor(() => {
        expect(screen.getByTestId('verify-button')).toHaveTextContent('Activating access...');
      });

      await settleAutoSubmit();
    });

    it("activates the free subscription, stores the token and lands on You're In! without touching checkout", async () => {
      const mockFetch = createFreeMockFetch();
      vi.stubGlobal('fetch', mockFetch);

      const { user, onClose } = renderFree();
      await goToVerifyAsFree(user);
      expect(localStorage.getItem(EXCHANGE_TOKEN_STORAGE_KEY)).toBeNull();

      await typeCode(user, '123456');

      await waitFor(() => {
        expect(screen.getByTestId('success-step')).toBeInTheDocument();
      });
      expect(screen.getByText("You're In!")).toBeInTheDocument();
      expect(screen.getByText("You've joined Diego Alcaino's free tier")).toBeInTheDocument();
      expect(
        screen.getByText("Your free subscription is active. You'll get access to free releases as they're published.")
      ).toBeInTheDocument();
      expect(screen.queryByTestId('step-indicator')).not.toBeInTheDocument();
      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/payments/free-subscribe'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer verified-token-123' }),
          body: JSON.stringify({ publisher_id: 'test-publisher-id' }),
        })
      );
      expect(callsTo(mockFetch, '/payments/checkout')).toHaveLength(0);
      expect(mockLocationHref).not.toHaveBeenCalled();
      // The bridge token is what DarkHeader reads to show the account chip.
      expect(localStorage.getItem(EXCHANGE_TOKEN_STORAGE_KEY)).toBe('verified-token-123');

      await settleAutoSubmit();

      expect(screen.getByTestId('success-close-button')).toHaveTextContent('Done');
      await user.click(screen.getByTestId('success-close-button'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('tells this tab about the new session with the storage event DarkHeader and the tenant links listen for', async () => {
      // Browsers fire `storage` only in other tabs. DarkHeader (account chip)
      // and the publisher page (bridge token on tenant links) re-read
      // localStorage in their listeners, so both keys must already be written
      // when the event arrives.
      const mockFetch = createFreeMockFetch();
      vi.stubGlobal('fetch', mockFetch);
      const seen: Array<{ key: string | null; newValue: string | null; token: string | null; email: string | null }> = [];
      const onStorage = (e: StorageEvent) => {
        seen.push({
          key: e.key,
          newValue: e.newValue,
          token: localStorage.getItem(EXCHANGE_TOKEN_STORAGE_KEY),
          email: localStorage.getItem('hb_account_email'),
        });
      };
      window.addEventListener('storage', onStorage);

      try {
        const { user } = renderFree();
        await goToVerifyAsFree(user);
        expect(seen).toEqual([]);

        await typeCode(user, '123456');
        await waitFor(() => {
          expect(screen.getByTestId('success-step')).toBeInTheDocument();
        });

        expect(seen).toEqual([
          {
            key: EXCHANGE_TOKEN_STORAGE_KEY,
            newValue: 'verified-token-123',
            token: 'verified-token-123',
            email: 'test@example.com',
          },
        ]);

        await settleAutoSubmit();
      } finally {
        window.removeEventListener('storage', onStorage);
      }
    });

    it('surfaces a free-subscribe failure', async () => {
      const mockFetch = createFreeMockFetch(() => jsonResponse({ detail: 'Already subscribed' }, false));
      vi.stubGlobal('fetch', mockFetch);

      const { user } = renderFree();
      await goToVerifyAsFree(user);
      await typeCode(user, '123456');

      await waitFor(() => {
        expect(screen.getByTestId('verify-error-message')).toHaveTextContent('Already subscribed');
      });
      expect(screen.queryByTestId('success-step')).not.toBeInTheDocument();

      await settleAutoSubmit();
    });
  });

  describe('Modal chrome', () => {
    it('is a labelled dialog with Close and Go back controls', async () => {
      const { user, onClose } = renderModal();

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBe(screen.getByTestId('subscribe-modal'));
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAccessibleName('Subscribe to Diego Alcaino');
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument();

      await goToEmail(user);
      expect(screen.getByRole('button', { name: 'Go back' })).toBe(screen.getByTestId('back-button'));

      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape', async () => {
      const { user, onClose } = renderModal();

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on a backdrop click but not on a click inside the dialog', async () => {
      const { user, onClose } = renderModal();
      const dialog = screen.getByRole('dialog');

      await user.click(dialog);
      expect(onClose).not.toHaveBeenCalled();

      await user.click(dialog.previousElementSibling as HTMLElement);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('resets to the pricing step with the default tier when reopened', async () => {
      const { user, onClose, rerender } = renderModal({ freeTierEnabled: true });

      await user.click(screen.getByTestId('tier-free'));
      await goToEmail(user);
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledTimes(1);

      rerender(<SubscribeModal {...defaultProps} freeTierEnabled onClose={onClose} isOpen={false} />);
      expect(screen.queryByTestId('subscribe-modal')).not.toBeInTheDocument();

      rerender(<SubscribeModal {...defaultProps} freeTierEnabled onClose={onClose} isOpen />);
      expect(screen.getByTestId('pricing-step')).toBeInTheDocument();
      expect(screen.getByTestId('continue-button')).toHaveTextContent('Subscribe for $29/month');
    });
  });
});
