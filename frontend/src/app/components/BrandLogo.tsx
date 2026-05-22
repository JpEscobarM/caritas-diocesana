import logoHorizontal from "../../assets/brand/caritas-logo-horizontal.png";
import logoVertical from "../../assets/brand/caritas-logo-vertical.png";
import logoSymbol from "../../assets/brand/caritas-symbol.png";

type BrandLogoVariant = "horizontal" | "vertical" | "symbol";

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  alt?: string;
  className?: string;
};

const logoByVariant: Record<BrandLogoVariant, string> = {
  horizontal: logoHorizontal,
  vertical: logoVertical,
  symbol: logoSymbol,
};

export default function BrandLogo({
  variant = "horizontal",
  alt = "Cáritas",
  className = "",
}: BrandLogoProps) {
  return (
    <img
      src={logoByVariant[variant]}
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}