import { getNavigationContent } from "@/lib/content/loader";
import { SiteNavClient } from "@/components/site-nav-client";

export async function SiteNav() {
  const navigation = await getNavigationContent();
  return <SiteNavClient navLinks={navigation.navLinks} cmsButtonLabel={navigation.cmsButtonLabel} />;
}
