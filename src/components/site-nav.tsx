import { getNavigationContent, getSiteSettings } from "@/lib/content/loader";
import { SiteNavClient } from "@/components/site-nav-client";

export async function SiteNav() {
  const [navigation, settings] = await Promise.all([getNavigationContent(), getSiteSettings()]);
  return (
    <SiteNavClient
      navLinks={navigation.navLinks}
      contactPhone={settings.contactPhone}
      contactEmail={settings.contactEmail}
      address={settings.address}
    />
  );
}
