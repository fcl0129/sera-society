import { useState } from "react";
import { Instagram, Linkedin, PartyPopper, Ticket, Twitter } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Editorial Minimal",
    role: "Elegant serif invitation for formal receptions",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    social: { twitter: "#", linkedin: "#", website: "#" },
  },
  {
    id: "2",
    name: "Dramatic Poster",
    role: "High-contrast party invite for nightlife events",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
    social: { twitter: "#", instagram: "#" },
  },
  {
    id: "3",
    name: "Social Invite",
    role: "Image-first style for rooftop and brunch moments",
    image:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80",
    social: { instagram: "#", linkedin: "#" },
  },
  {
    id: "4",
    name: "Formal Dinner",
    role: "Classic invitation layout for black-tie dinners",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
    social: { linkedin: "#" },
  },
  {
    id: "5",
    name: "Fashion Forward",
    role: "Editorial, asymmetric layout for launch previews",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80",
    social: { twitter: "#", linkedin: "#" },
  },
  {
    id: "6",
    name: "After Hours",
    role: "Moody modern invite for DJs and late sets",
    image:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=900&q=80",
    social: { instagram: "#", website: "#" },
  },
];

interface TeamShowcaseProps {
  members?: TeamMember[];
}

export default function TeamShowcase({ members = DEFAULT_MEMBERS }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const col1 = members.filter((_, i) => i % 3 === 0);
  const col2 = members.filter((_, i) => i % 3 === 1);
  const col3 = members.filter((_, i) => i % 3 === 2);

  return (
    <div className="flex w-full max-w-5xl select-none flex-col items-start gap-8 px-4 py-8 font-sans md:flex-row md:gap-10 md:px-6 lg:gap-14">
      <div className="flex flex-shrink-0 gap-2 overflow-x-auto pb-1 md:gap-3 md:pb-0">
        <div className="flex flex-col gap-2 md:gap-3">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[120px] w-[110px] sm:h-[140px] sm:w-[130px] md:h-[165px] md:w-[155px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        <div className="mt-[48px] flex flex-col gap-2 sm:mt-[56px] md:mt-[68px] md:gap-3">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[132px] w-[122px] sm:h-[155px] sm:w-[145px] md:h-[182px] md:w-[172px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        <div className="mt-[22px] flex flex-col gap-2 sm:mt-[26px] md:mt-[32px] md:gap-3">
          {col3.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[125px] w-[115px] sm:h-[146px] sm:w-[136px] md:h-[172px] md:w-[162px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-4 pt-0 sm:grid sm:grid-cols-2 md:flex md:flex-col md:gap-5 md:pt-2">
        {members.map((member) => (
          <MemberRow key={member.id} member={member} hoveredId={hoveredId} onHover={setHoveredId} />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={cn(
        "cursor-pointer overflow-hidden rounded-xl flex-shrink-0 transition-opacity duration-300",
        className,
        isDimmed ? "opacity-60" : "opacity-100",
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <img
        src={member.image}
        alt={member.name}
        className="h-full w-full object-cover transition-[filter] duration-500"
        style={{
          filter: isActive ? "grayscale(0) brightness(1)" : "grayscale(1) brightness(0.77)",
        }}
      />
    </div>
  );
}

function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial =
    member.social?.twitter ?? member.social?.linkedin ?? member.social?.instagram ?? member.social?.website;

  return (
    <div
      className={cn("cursor-pointer transition-opacity duration-300", isDimmed ? "opacity-50" : "opacity-100")}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "h-3 w-4 flex-shrink-0 rounded-[5px] transition-all duration-300",
            isActive ? "w-5 bg-foreground" : "bg-foreground/25",
          )}
        />
        <span
          className={cn(
            "text-base font-semibold leading-none tracking-tight transition-colors duration-300 md:text-[18px]",
            isActive ? "text-foreground" : "text-foreground/80",
          )}
        >
          {member.name}
        </span>

        {hasSocial && (
          <div
            className={cn(
              "ml-0.5 flex items-center gap-1.5 transition-all duration-200",
              isActive ? "translate-x-0 opacity-100" : "-translate-x-2 pointer-events-none opacity-0",
            )}
          >
            {member.social?.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-muted-foreground transition-all duration-150 hover:scale-110 hover:bg-foreground/10 hover:text-foreground"
                title="X / Twitter"
              >
                <Twitter size={10} />
              </a>
            )}
            {member.social?.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-muted-foreground transition-all duration-150 hover:scale-110 hover:bg-foreground/10 hover:text-foreground"
                title="LinkedIn"
              >
                <Linkedin size={10} />
              </a>
            )}
            {member.social?.instagram && (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-muted-foreground transition-all duration-150 hover:scale-110 hover:bg-foreground/10 hover:text-foreground"
                title="Instagram"
              >
                <Instagram size={10} />
              </a>
            )}
            {member.social?.website && (
              <a
                href={member.social.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-muted-foreground transition-all duration-150 hover:scale-110 hover:bg-foreground/10 hover:text-foreground"
                title="Event Website"
              >
                {isActive ? <PartyPopper size={10} /> : <Ticket size={10} />}
              </a>
            )}
          </div>
        )}
      </div>

      <p className="mt-1.5 pl-[27px] text-[7px] font-medium uppercase tracking-[0.2em] text-muted-foreground md:text-[10px]">
        {member.role}
      </p>
    </div>
  );
}
