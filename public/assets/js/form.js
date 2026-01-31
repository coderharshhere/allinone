<style>
  /* Payment Pending Badge */
  .status-pending {
    background: #ffc107;
    color: #000;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  /* Swal Custom Styling */
  .swal2-custom-popup {
    border-radius: 15px !important;
    padding: 20px !important;
  }
  
  .swal2-warning {
    border-color: #ffc107 !important;
    color: #ffc107 !important;
  }
</style>
