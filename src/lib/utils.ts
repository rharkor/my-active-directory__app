import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shouldRedirect(from: string, to: string) {
  return from !== to;
}

export const passwordRegex = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
);

export function getImageFromOsName(name?: string) {
  if (!name) return 'unknown-logo';

  if (
    [
      'Android',
      'CyanogenMod',
      'LineageOS',
      'MIUI',
      'OxygenOS',
      'One UI',
      'Windows Phone',
      'Windows Mobile',
      'ColorOS',
    ].includes(name)
  ) {
    return 'android-logo';
  }

  if (['iOS', 'iPadOS'].includes(name)) {
    return 'ios-logo';
  }

  if (['Windows']) {
    return 'windows-logo';
  }

  if (
    [
      'Arch',
      'CentOS',
      'Debian',
      'Fedora',
      'Gentoo',
      'Linux Mint',
      'openSUSE',
      'Red Hat',
      'Ubuntu',
    ].includes(name)
  ) {
    return 'linux-logo';
  }

  if (['macOS', 'OS X'].includes(name)) {
    return 'macos-logo';
  }

  return 'unknown-logo';
}
