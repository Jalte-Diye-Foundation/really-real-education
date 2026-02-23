const banner = document.getElementById('notice-banner');
const dismissButton = document.getElementById('notice-dismiss');

if (banner && dismissButton) {
  const dismissed = localStorage.getItem('rre_notice_dismissed') === 'true';

  if (dismissed) {
    banner.style.display = 'none';
  }

  dismissButton.addEventListener('click', () => {
    banner.style.display = 'none';
    localStorage.setItem('rre_notice_dismissed', 'true');
  });
}
