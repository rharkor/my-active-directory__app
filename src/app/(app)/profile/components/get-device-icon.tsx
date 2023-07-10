import { DesktopIcon, MobileIcon } from '@radix-ui/react-icons';

export default function GetDeviceIcon({ name }: { name?: string }) {
  if (!name) {
    return <DesktopIcon />;
    // return 'unknown-logo';
  }

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
    // return 'android-logo';
    return <MobileIcon />;
  }

  if (['iOS', 'iPadOS'].includes(name)) {
    // return 'ios-logo';
    return <MobileIcon />;
  }

  if (['Windows']) {
    // return 'windows-logo';
    return <DesktopIcon />;
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
    // return 'linux-logo';
    return <DesktopIcon />;
  }

  if (['macOS', 'OS X'].includes(name)) {
    // return 'macos-logo';
    return <DesktopIcon />;
  }

  // return 'unknown-logo';
  return <DesktopIcon />;
}
