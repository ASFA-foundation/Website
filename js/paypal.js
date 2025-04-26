document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const config = {
    paypal: {
      clientId: 'YOUR_CLIENT_ID',
      currency: 'USD',
      style: {
        color: 'gold',
        shape: 'rect',
        height: 40
      }
    },
    amounts: {
      oneTime: [10, 25, 50, 100],
      monthly: [5, 10, 25, 50]
    }
  };

  // Elements
  const elements = {
    customToggle: document.getElementById('custom-toggle'),
    customAmount: document.getElementById('custom-amount'),
    monthlySelect: document.getElementById('monthly-amount'),
    customMonthly: document.getElementById('custom-monthly'),
    donationModal: document.getElementById('donationModal'),
    paypalOneTimeContainer: document.getElementById('paypal-onetime-container'),
    paypalMonthlyContainer: document.getElementById('paypal-monthly-container')
  };

  // Validate elements exist
  if (!elements.customToggle || !elements.customAmount || !elements.monthlySelect || 
      !elements.customMonthly || !elements.donationModal) {
    console.error('Required donation form elements not found');
    return;
  }

  // Load PayPal SDK
  function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
      if (window.paypal) return resolve(); // Already loaded

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${config.paypal.clientId}&currency=${config.paypal.currency}&vault=true`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Toggle Custom Amount Fields
  function setupAmountToggles() {
    // One-time donation amount buttons
    document.querySelectorAll('.donation-amount').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.donation-amount').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        elements.customAmount.classList.add('d-none');
      });
    });

    // Custom amount toggle
    elements.customToggle.addEventListener('click', function() {
      document.querySelectorAll('.donation-amount').forEach(btn => btn.classList.remove('active'));
      elements.customAmount.classList.remove('d-none');
      elements.customAmount.focus();
    });

    // Monthly donation select
    elements.monthlySelect.addEventListener('change', function() {
      elements.customMonthly.classList.toggle('d-none', this.value !== 'custom');
      if (this.value !== 'custom') elements.customMonthly.value = '';
    });
  }

  // Get donation amount with validation
  function getDonationAmount(isMonthly = false) {
    const amountField = isMonthly ? elements.customMonthly : elements.customAmount;
    const activeAmount = document.querySelector('.donation-amount.active')?.dataset.amount;
    const selectAmount = isMonthly ? elements.monthlySelect.value : null;
    
    let amount = activeAmount || 
                (isMonthly ? (selectAmount === 'custom' ? amountField.value : selectAmount) : amountField.value) || 
                (isMonthly ? config.amounts.monthly[0] : config.amounts.oneTime[1]);

    amount = parseFloat(amount).toFixed(2);
    
    if (isNaN(amount) || amount <= 0) {
      console.error('Invalid donation amount:', amount);
      return null;
    }
    
    return amount;
  }

  // Initialize PayPal Buttons
  async function initializePayPal() {
    try {
      await loadPayPalSDK();
      
      if (!window.paypal) {
        throw new Error('PayPal SDK failed to load');
      }

      // One-Time Donation
      if (elements.paypalOneTimeContainer) {
        paypal.Buttons({
          style: {
            ...config.paypal.style,
            label: 'pay'
          },
          createOrder: function(data, actions) {
            const amount = getDonationAmount();
            if (!amount) return Promise.reject('Invalid amount');
            
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount,
                  breakdown: {
                    item_total: {
                      value: amount,
                      currency_code: config.paypal.currency
                    }
                  }
                },
                items: [{
                  name: 'One-Time Donation to ASFA Foundation',
                  unit_amount: {
                    value: amount,
                    currency_code: config.paypal.currency
                  },
                  quantity: '1',
                  category: 'DONATION'
                }]
              }]
            });
          },
          onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
              showSuccessMessage(`Thank you, ${details.payer.name.given_name}! Your donation of $${details.purchase_units[0].amount.value} was processed.`);
              $(elements.donationModal).modal('hide');
            });
          },
          onError: function(err) {
            console.error('PayPal error:', err);
            showErrorMessage('There was an error processing your donation. Please try again.');
          }
        }).render('#paypal-onetime-container');
      }

      // Monthly Donation
      if (elements.paypalMonthlyContainer) {
        paypal.Buttons({
          style: {
            ...config.paypal.style,
            label: 'subscribe'
          },
          createSubscription: function(data, actions) {
            const amount = getDonationAmount(true);
            if (!amount) return Promise.reject('Invalid amount');
            
            return actions.subscription.create({
              plan_id: getPlanIdForAmount(amount),
              custom_id: `monthly_${amount}`
            });
          },
          onApprove: function(data, actions) {
            showSuccessMessage(`Thank you for your monthly commitment! We've sent a confirmation to your email.`);
            $(elements.donationModal).modal('hide');
          },
          onError: function(err) {
            console.error('PayPal subscription error:', err);
            showErrorMessage('There was an error setting up your monthly donation. Please try again.');
          }
        }).render('#paypal-monthly-container');
      }
    } catch (error) {
      console.error('PayPal initialization failed:', error);
      showErrorMessage('Unable to load payment options. Please refresh the page or try again later.');
    }
  }

  // Helper functions
  function getPlanIdForAmount(amount) {
    // In production, this should be handled server-side
    // This is just a mock implementation
    const plans = {
      '5.00': 'P-5MONTHLY',
      '10.00': 'P-10MONTHLY',
      '25.00': 'P-25MONTHLY',
      '50.00': 'P-50MONTHLY'
    };
    
    return plans[amount] || plans['10.00'];
  }

  function showSuccessMessage(message) {
    // Replace with your preferred notification system
    alert(message);
  }

  function showErrorMessage(message) {
    // Replace with your preferred error display
    alert(message);
  }

  // Initialize
  setupAmountToggles();
  initializePayPal();
});