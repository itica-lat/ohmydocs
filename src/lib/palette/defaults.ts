import type { BrandingProfile } from "@/types/schemas";
import { ETERNUM_PALETTE } from "@/types/palette";
import { ETERNUM_DOC_FONTS } from "@/lib/fonts/catalog";

export const ETERNUM_BRANDING_ID = "branding:eternum-default";

export const ETERNUM_BRANDING: BrandingProfile = {
  id: ETERNUM_BRANDING_ID,
  name: "Eternum (default)",
  palette: ETERNUM_PALETTE,
  fonts: {
    serif: ETERNUM_DOC_FONTS.serif,
    sans: ETERNUM_DOC_FONTS.sans,
    mono: ETERNUM_DOC_FONTS.mono,
  },
  logo: null,
  banner: null,
  readOnly: true,
};
