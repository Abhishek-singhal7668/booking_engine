import React from 'react';
import Modal from 'react-modal';

const PrivacyPolicyModal = ({ isOpen, onRequestClose }) => {
  return(
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Privacy Policy"
    style={{
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000 // Ensure the overlay is on top of other content
      },
      content: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        border: '1px solid #ccc',
        background: '#fff',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        width: '80%', // Responsive width
        maxWidth: '600px', // Maximum width
        maxHeight: '90vh', // Maximum height to fit in most views
        overflowY: 'auto' // Allow scrolling within the modal
      }
    }}
  >
   <h2 className="font-bold mb-4" style={{ color: '#000', textAlign: 'center', fontSize: '2rem' }}>Privacy Policy</h2>
   <p>This privacy policy sets out how we use and protects any information that you give us when you use this website.</p>
    <p>We are committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, then you can be assured that it will only be used in accordance with this privacy statement.</p>
    <p>We may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you are happy with any changes.</p>
    <h3 className="font-bold text-lg mt-4">What we collect</h3>
    <p>We may collect the following information:</p>
    <ul className="list-disc list-inside ml-4">
      <li>name and job title</li>
      <li>contact information including email address</li>
      <li>demographic information such as postcode, preferences and interests</li>
    </ul>
    <h3 className="font-bold text-lg mt-4">What we do with the information we gather</h3>
    <p>We require this information to understand your needs and provide you with a better service, and for the following reasons:</p>
    <ul className="list-disc list-inside ml-4">
      <li>Internal record keeping.</li>
      <li>We may use the information to improve our products and services.</li>
      <li>We may periodically send promotional email about new products, special offers or other information which we think you may find interesting using the email address which you have provided, to do this you need to opt in for this service.</li>
      <li>We may  you by email, phone, or mail.</li>
      <li>We may use the information to customise the website according to your interests.</li>
    </ul>
    <h3 className="font-bold text-lg mt-4">Security</h3>
    <p>We are committed to ensuring that your information is secure. To prevent unauthorised access or disclosure we have put in place suitable physical, electronic and managerial procedures to safeguard and secure the information we collect online.</p>
    <h3 className="font-bold text-lg mt-4">How we use cookies</h3>
    <p>A cookie is an element of data that a website can send to your browser, which may then store it on your system. We use cookies in some of our pages to store your preferences and record session information. The information that we collect is then used to ensure a more personalized service level for our users. Please be assured though that your credit card number will not be saved for security reasons. You must type the credit card number each time you make a purchase.</p>
    <p>You can adjust settings on your browser so that you will be notified when you receive a cookie. Please refer to your browser documentation to check if cookies have been enabled on your computer or to request not to receive cookies. As cookies allow you to take advantage of some of the Website’s essential features, we recommend that you accept cookies. For instance, if you block or otherwise reject our cookies, you will not be able to book flights or use any products or services on the Website that require you to log-in.</p>
    <p>This information is treated confidentially and will not be shared with anyone outside of the Company unless otherwise stated in this Privacy Policy. We will only use this information to make informed decisions regarding the purchase of online advertising.</p>
    <h3 className="font-bold text-lg mt-4">Links to other websites</h3>
    <p>Our website may contain links to enable you to visit other websites of interest easily. However, once you have used these links to leave our site, you should note that we do not have any control over that other website. Therefore, we cannot be responsible for the protection and privacy of any information which you provide whilst visiting such sites and such sites are not governed by this privacy statement. You should exercise caution and look at the privacy statement applicable to the website in question.</p>
    <h3 className="font-bold text-lg mt-4">Controlling your personal information</h3>
    <p>You may choose to restrict the collection or use of your personal information in the following ways:</p>
    <p>We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so.</p>
    <p>You may request details of personal information which we hold about you under the Data Protection Act 1998.</p>
    <p>If you believe that any information we are holding on you is incorrect or incomplete, please write to or email us as soon as possible, at the above address. We will promptly correct any information found to be incorrect.</p>
    <button onClick={onRequestClose} className="mt-4 p-2 bg-brand text-white rounded">Close</button>
  </Modal>
  );
};

export default PrivacyPolicyModal;
