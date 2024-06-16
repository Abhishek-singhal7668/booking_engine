import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RazorpayCheckout = ({ pageInfo, formData, onPaymentSuccess }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    const paymentData = {
      amount: pageInfo.total * 100, // Razorpay amount is in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: 'receipt#1',
    };

    const options = {
      key: 'rzp_test_LQaX9TQGtDjyCR', // Enter the Test API Key ID here
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: 'Finner',
      description: 'Test Transaction',
      handler: function (response) {
        const paymentId = response.razorpay_payment_id;
        const orderId = 'order_id_mocked'; // Mocked order ID
        const signature = 'signature_mocked'; // Mocked signature

        // Simulate verification
        const isVerified = true; // Mock verification status

        if (isVerified) {
          toast.success('Payment successful!');

          // Call the onPaymentSuccess callback with the payment and booking details
          onPaymentSuccess({
            paymentId,
            orderId,
            formData,
            pageInfo,
          });
        } else {
          toast.error('Payment verification failed. Please try again.');
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        address: 'Corporate Office',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="checkout-container">
      <button onClick={handlePayment} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`">
        Pay with Razorpay
      </button>
      <ToastContainer />
    </div>
  );
};

export default RazorpayCheckout;
