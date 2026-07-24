import { InstagramIcon, LinkedInIcon } from "@/components/icons/SocialIcons";

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/leaninorg/",
    label: "Lean In on Instagram",
    Icon: InstagramIcon,
  },
  {
    href: "https://www.linkedin.com/company/leaninorg",
    label: "Lean In on LinkedIn",
    Icon: LinkedInIcon,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-ink">
      <div className="mx-auto flex max-w-[1440px] items-center px-4 py-4 sm:px-6 lg:px-10">
        <nav aria-label="Social" className="flex items-center gap-4 text-ink-muted">
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="inline-flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <Icon className="h-[1.375rem] w-[1.375rem]" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
