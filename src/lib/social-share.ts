export function getTwitterShareUrl(menuUrl: string, honoree: string): string {
  const text = `Check out ${honoree}'s Masters Club Dinner menu!`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(menuUrl)}`;
}

export function getFacebookShareUrl(menuUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(menuUrl)}`;
}

export function getInstagramCopyText(menuUrl: string, honoree: string): string {
  return `Check out ${honoree}'s Masters Club Dinner menu!\n\n${menuUrl}\n\n#MastersDinner #AugustaNational #Masters`;
}

export function getTikTokCopyText(menuUrl: string, honoree: string): string {
  return `Check out ${honoree}'s Masters Club Dinner menu!\n\n${menuUrl}\n\n#MastersDinner #AugustaNational #Masters`;
}

