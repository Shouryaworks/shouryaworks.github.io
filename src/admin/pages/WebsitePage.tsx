import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { useSiteContent } from "../../content/SiteContentProvider";
import { newId } from "../../content/resolve";
import type { PricingTier, ServiceItem, SiteContent } from "../../content/types";
import {
  Badge,
  Button,
  Field,
  IconButton,
  Panel,
  Select,
  Tabs,
  TagInput,
  TextArea,
  TextInput,
  Toggle,
  useToast,
} from "../ui";
import ImageField from "../components/ImageField";
import ImagePicker from "../components/ImagePicker";
import SaveBar from "../components/SaveBar";
import PreviewFrame from "../components/PreviewFrame";

const TABS = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "marquee", label: "Previews" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
  { id: "navigation", label: "Navigation & SEO" },
];

const initialTab = () => new URLSearchParams(window.location.search).get("tab") ?? "hero";

/** Moves an item within a list without mutating the original. */
const move = <T,>(list: T[], index: number, delta: number): T[] => {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return list;
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
};

/**
 * The website content editor: every string, list and image the public pages
 * read, grouped by the section it belongs to. The layout itself is untouched —
 * only the data behind it is editable.
 */
export default function WebsitePage() {
  const { draft, update, save, dirty, openPreview } = useSiteContent();
  const { push } = useToast();
  const [tab, setTab] = useState(initialTab);

  const changeTab = (next: string) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url);
  };

  const patch = (mutate: (content: SiteContent) => void) => update(mutate);

  const handleSave = async () => {
    const result = await save();
    if (result.errors.length) {
      push(result.errors.slice(0, 3).join(" "), "error");
      return;
    }
    push(result.message, result.ok ? (result.mode === "remote" ? "success" : "info") : "error");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={TABS} active={tab} onChange={changeTab} />
        <Button type="button" size="sm" variant="ghost" onClick={openPreview}>
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Preview
        </Button>
      </div>

      {tab === "hero" ? (
        <Panel title="Hero" description="The first thing visitors see.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <Field label="Headline" htmlFor="hero-headline" required>
                <TextInput
                  id="hero-headline"
                  value={draft.hero.headline}
                  maxLength={60}
                  onChange={(event) =>
                    patch((content) => {
                      content.hero.headline = event.target.value;
                    })
                  }
                />
              </Field>
              <Field
                label="Subtitle"
                htmlFor="hero-subtitle"
                hint="The short uppercase line under the headline."
              >
                <TextArea
                  id="hero-subtitle"
                  rows={2}
                  maxLength={180}
                  value={draft.hero.subtitle}
                  onChange={(event) =>
                    patch((content) => {
                      content.hero.subtitle = event.target.value;
                    })
                  }
                />
              </Field>
              <Field
                label="Description"
                htmlFor="hero-description"
                hint="Longer copy for screen readers and search engines. Not shown on screen."
              >
                <TextArea
                  id="hero-description"
                  rows={3}
                  maxLength={320}
                  value={draft.hero.description}
                  onChange={(event) =>
                    patch((content) => {
                      content.hero.description = event.target.value;
                    })
                  }
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Button text" htmlFor="hero-cta-text" required>
                  <TextInput
                    id="hero-cta-text"
                    value={draft.hero.ctaText}
                    maxLength={40}
                    onChange={(event) =>
                      patch((content) => {
                        content.hero.ctaText = event.target.value;
                      })
                    }
                  />
                </Field>
                <Field label="Button destination" htmlFor="hero-cta-href" required>
                  <TextInput
                    id="hero-cta-href"
                    value={draft.hero.ctaHref}
                    placeholder="/contact"
                    onChange={(event) =>
                      patch((content) => {
                        content.hero.ctaHref = event.target.value;
                      })
                    }
                  />
                </Field>
              </div>
              <Field
                label="Small label above the headline"
                htmlFor="hero-badge"
                hint="Optional. Leave empty to hide it."
              >
                <TextInput
                  id="hero-badge"
                  value={draft.hero.badge}
                  maxLength={40}
                  onChange={(event) =>
                    patch((content) => {
                      content.hero.badge = event.target.value;
                    })
                  }
                />
              </Field>
            </div>

            <div className="flex flex-col gap-4">
              <ImageField
                label="Hero portrait"
                hint="The magnet-hover image in the middle of the hero."
                imageId={draft.hero.portrait}
                alt={draft.hero.portraitAlt}
                onAltChange={(alt) =>
                  patch((content) => {
                    content.hero.portraitAlt = alt;
                  })
                }
                onChange={(id) =>
                  patch((content) => {
                    content.hero.portrait = id;
                  })
                }
              />
            </div>
          </div>
        </Panel>
      ) : null}

      {tab === "about" ? (
        <Panel title="About" description="Your introduction and the 3D objects around it.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <Field label="Heading" htmlFor="about-title" required>
                <TextInput
                  id="about-title"
                  value={draft.about.title}
                  maxLength={40}
                  onChange={(event) =>
                    patch((content) => {
                      content.about.title = event.target.value;
                    })
                  }
                />
              </Field>
              <Field
                label="Bio"
                htmlFor="about-body"
                hint="Revealed word by word as the visitor scrolls."
              >
                <TextArea
                  id="about-body"
                  rows={8}
                  maxLength={1400}
                  value={draft.about.body}
                  onChange={(event) =>
                    patch((content) => {
                      content.about.body = event.target.value;
                    })
                  }
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Extra heading" htmlFor="about-extra-title">
                  <TextInput
                    id="about-extra-title"
                    value={draft.about.extraTitle}
                    maxLength={60}
                    onChange={(event) =>
                      patch((content) => {
                        content.about.extraTitle = event.target.value;
                      })
                    }
                  />
                </Field>
                <Field label="Location" htmlFor="about-location">
                  <TextInput
                    id="about-location"
                    value={draft.about.location}
                    maxLength={60}
                    onChange={(event) =>
                      patch((content) => {
                        content.about.location = event.target.value;
                      })
                    }
                  />
                </Field>
              </div>
              <Field
                label="Extra text"
                htmlFor="about-extra"
                hint="Optional second paragraph. Only rendered when it has text."
              >
                <TextArea
                  id="about-extra"
                  rows={4}
                  maxLength={600}
                  value={draft.about.extraText}
                  onChange={(event) =>
                    patch((content) => {
                      content.about.extraText = event.target.value;
                    })
                  }
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Button text" htmlFor="about-cta-text">
                  <TextInput
                    id="about-cta-text"
                    value={draft.about.ctaText}
                    maxLength={40}
                    onChange={(event) =>
                      patch((content) => {
                        content.about.ctaText = event.target.value;
                      })
                    }
                  />
                </Field>
                <Field label="Button destination" htmlFor="about-cta-href">
                  <TextInput
                    id="about-cta-href"
                    value={draft.about.ctaHref}
                    placeholder="/contact"
                    onChange={(event) =>
                      patch((content) => {
                        content.about.ctaHref = event.target.value;
                      })
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <ImageField
                label="Profile image"
                hint="Optional. Leave empty to reuse the hero portrait."
                imageId={draft.about.profileImage}
                onChange={(id) =>
                  patch((content) => {
                    content.about.profileImage = id;
                  })
                }
              />
              {(
                [
                  ["moon", "Moon decoration"],
                  ["lego", "Lego decoration"],
                  ["p59", "Abstract decoration"],
                  ["group", "Group decoration"],
                ] as const
              ).map(([key, label]) => (
                <ImageField
                  key={key}
                  label={label}
                  imageId={draft.about.decor[key]}
                  onChange={(id) =>
                    patch((content) => {
                      content.about.decor[key] = id;
                    })
                  }
                />
              ))}
            </div>
          </div>
        </Panel>
      ) : null}

      {tab === "services" ? (
        <Panel
          title="Services"
          description="Reorder, rename, hide or add services."
          actions={
            <Button
              type="button"
              size="sm"
              onClick={() =>
                patch((content) => {
                  const service: ServiceItem = {
                    id: newId("service"),
                    title: "New service",
                    description: "",
                    icon: "sparkles",
                    visible: true,
                  };
                  content.services.items = [...content.services.items, service];
                })
              }
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add service
            </Button>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Section heading" htmlFor="services-title">
              <TextInput
                id="services-title"
                value={draft.services.title}
                maxLength={40}
                onChange={(event) =>
                  patch((content) => {
                    content.services.title = event.target.value;
                  })
                }
              />
            </Field>
            <Field label="Intro line" htmlFor="services-description">
              <TextInput
                id="services-description"
                value={draft.services.description}
                maxLength={160}
                placeholder="Optional sentence under the heading"
                onChange={(event) =>
                  patch((content) => {
                    content.services.description = event.target.value;
                  })
                }
              />
            </Field>
          </div>

          <ul className="mt-5 flex flex-col gap-3">
            {draft.services.items.map((service, index) => (
              <li
                key={service.id}
                className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold text-[#D7E2EA]/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="grid min-w-[200px] flex-1 gap-3 sm:grid-cols-[1fr_140px]">
                    <TextInput
                      value={service.title}
                      aria-label={`Service ${index + 1} title`}
                      onChange={(event) =>
                        patch((content) => {
                          const item = content.services.items.find(
                            (entry) => entry.id === service.id,
                          );
                          if (item) item.title = event.target.value;
                        })
                      }
                    />
                    <Select
                      value={service.icon}
                      aria-label={`Service ${index + 1} icon`}
                      onChange={(event) =>
                        patch((content) => {
                          const item = content.services.items.find(
                            (entry) => entry.id === service.id,
                          );
                          if (item) item.icon = event.target.value;
                        })
                      }
                    >
                      {["layout", "code", "compass", "sparkles", "wand", "monitor", "pen"].map(
                        (icon) => (
                          <option key={icon} value={icon} className="bg-[#0C0C0C]">
                            {icon}
                          </option>
                        ),
                      )}
                    </Select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <IconButton
                      label="Move up"
                      disabled={index === 0}
                      onClick={() =>
                        patch((content) => {
                          content.services.items = move(content.services.items, index, -1);
                        })
                      }
                    >
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label="Move down"
                      disabled={index === draft.services.items.length - 1}
                      onClick={() =>
                        patch((content) => {
                          content.services.items = move(content.services.items, index, 1);
                        })
                      }
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label={service.visible ? "Hide service" : "Show service"}
                      onClick={() =>
                        patch((content) => {
                          const item = content.services.items.find(
                            (entry) => entry.id === service.id,
                          );
                          if (item) item.visible = !item.visible;
                        })
                      }
                    >
                      {service.visible ? (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      )}
                    </IconButton>
                    <IconButton
                      label="Delete service"
                      onClick={() =>
                        patch((content) => {
                          content.services.items = content.services.items.filter(
                            (entry) => entry.id !== service.id,
                          );
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>

                <TextArea
                  className="mt-3"
                  rows={2}
                  aria-label={`Service ${index + 1} description`}
                  value={service.description}
                  onChange={(event) =>
                    patch((content) => {
                      const item = content.services.items.find(
                        (entry) => entry.id === service.id,
                      );
                      if (item) item.description = event.target.value;
                    })
                  }
                />

                {!service.visible ? (
                  <p className="mt-2">
                    <Badge tone="warn">Hidden from the site</Badge>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {tab === "marquee" ? (
        <MarqueeEditor />
      ) : null}

      {tab === "pricing" ? (
        <PricingEditor onSave={handleSave} />
      ) : null}

      {tab === "contact" ? (
        <Panel title="Contact" description="The page visitors use to get in touch.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <Field label="Eyebrow" htmlFor="contact-eyebrow">
                <TextInput
                  id="contact-eyebrow"
                  value={draft.contact.eyebrow}
                  maxLength={60}
                  onChange={(event) =>
                    patch((content) => {
                      content.contact.eyebrow = event.target.value;
                    })
                  }
                />
              </Field>
              <Field label="Heading" htmlFor="contact-title">
                <TextInput
                  id="contact-title"
                  value={draft.contact.title}
                  maxLength={60}
                  onChange={(event) =>
                    patch((content) => {
                      content.contact.title = event.target.value;
                    })
                  }
                />
              </Field>
              <Field label="Description" htmlFor="contact-description">
                <TextArea
                  id="contact-description"
                  rows={3}
                  maxLength={320}
                  value={draft.contact.description}
                  onChange={(event) =>
                    patch((content) => {
                      content.contact.description = event.target.value;
                    })
                  }
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" htmlFor="contact-email">
                  <TextInput
                    id="contact-email"
                    type="email"
                    value={draft.contact.email}
                    onChange={(event) =>
                      patch((content) => {
                        content.contact.email = event.target.value;
                      })
                    }
                  />
                </Field>
                <Field label="Primary button text" htmlFor="contact-cta">
                  <TextInput
                    id="contact-cta"
                    value={draft.contact.ctaText}
                    maxLength={40}
                    onChange={(event) =>
                      patch((content) => {
                        content.contact.ctaText = event.target.value;
                      })
                    }
                  />
                </Field>
                <Field label="Secondary button text" htmlFor="contact-cta-2">
                  <TextInput
                    id="contact-cta-2"
                    value={draft.contact.secondaryCtaText}
                    maxLength={40}
                    onChange={(event) =>
                      patch((content) => {
                        content.contact.secondaryCtaText = event.target.value;
                      })
                    }
                  />
                </Field>
                <Field label="Secondary button destination" htmlFor="contact-cta-2-href">
                  <TextInput
                    id="contact-cta-2-href"
                    value={draft.contact.secondaryCtaHref}
                    placeholder="/projects"
                    onChange={(event) =>
                      patch((content) => {
                        content.contact.secondaryCtaHref = event.target.value;
                      })
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <Toggle
                label="Show the enquiry form"
                description="Visitors can send a message straight from the contact page."
                checked={draft.contact.formEnabled}
                onChange={(next) =>
                  patch((content) => {
                    content.contact.formEnabled = next;
                  })
                }
              />
              <Field label="Form heading" htmlFor="contact-form-title">
                <TextInput
                  id="contact-form-title"
                  value={draft.contact.formTitle}
                  maxLength={60}
                  onChange={(event) =>
                    patch((content) => {
                      content.contact.formTitle = event.target.value;
                    })
                  }
                />
              </Field>
              <Field label="Form note" htmlFor="contact-form-note">
                <TextInput
                  id="contact-form-note"
                  value={draft.contact.formNote}
                  maxLength={120}
                  onChange={(event) =>
                    patch((content) => {
                      content.contact.formNote = event.target.value;
                    })
                  }
                />
              </Field>
              <Field label="What do you need? options" htmlFor="contact-types">
                <TagInput
                  id="contact-types"
                  label="Enquiry types"
                  values={draft.contact.enquiryTypes}
                  onChange={(next) =>
                    patch((content) => {
                      content.contact.enquiryTypes = next;
                    })
                  }
                />
              </Field>
              <Field label="Budget options" htmlFor="contact-budgets">
                <TagInput
                  id="contact-budgets"
                  label="Budget options"
                  values={draft.contact.budgets}
                  onChange={(next) =>
                    patch((content) => {
                      content.contact.budgets = next;
                    })
                  }
                />
              </Field>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#D7E2EA]/60">
                    Social links
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      patch((content) => {
                        content.contact.socials = [
                          ...content.contact.socials,
                          { id: newId("social"), label: "New link", href: "https://" },
                        ];
                      })
                    }
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Add
                  </Button>
                </div>
                {draft.contact.socials.length ? (
                  <ul className="flex flex-col gap-2">
                    {draft.contact.socials.map((social) => (
                      <li key={social.id} className="flex items-center gap-2">
                        <TextInput
                          className="max-w-[160px]"
                          value={social.label}
                          aria-label="Social label"
                          onChange={(event) =>
                            patch((content) => {
                              const item = content.contact.socials.find(
                                (entry) => entry.id === social.id,
                              );
                              if (item) item.label = event.target.value;
                            })
                          }
                        />
                        <TextInput
                          value={social.href}
                          aria-label="Social link"
                          placeholder="https://…"
                          onChange={(event) =>
                            patch((content) => {
                              const item = content.contact.socials.find(
                                (entry) => entry.id === social.id,
                              );
                              if (item) item.href = event.target.value;
                            })
                          }
                        />
                        <IconButton
                          label="Remove link"
                          onClick={() =>
                            patch((content) => {
                              content.contact.socials = content.contact.socials.filter(
                                (entry) => entry.id !== social.id,
                              );
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#D7E2EA]/40">
                    No social links yet. They appear as pills on the contact page.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Panel>
      ) : null}

      {tab === "navigation" ? (
        <Panel title="Navigation & SEO" description="The top bar and the document head.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <Field label="Brand text" htmlFor="brand">
                <TextInput
                  id="brand"
                  value={draft.settings.brand}
                  maxLength={24}
                  onChange={(event) =>
                    patch((content) => {
                      content.settings.brand = event.target.value;
                    })
                  }
                />
              </Field>
              <Field label="Page title" htmlFor="site-title" hint="Shown in the browser tab and to search engines.">
                <TextInput
                  id="site-title"
                  value={draft.settings.siteTitle}
                  maxLength={70}
                  onChange={(event) =>
                    patch((content) => {
                      content.settings.siteTitle = event.target.value;
                    })
                  }
                />
              </Field>
              <Field label="Meta description" htmlFor="meta-description">
                <TextArea
                  id="meta-description"
                  rows={3}
                  maxLength={200}
                  value={draft.settings.metaDescription}
                  onChange={(event) =>
                    patch((content) => {
                      content.settings.metaDescription = event.target.value;
                    })
                  }
                />
              </Field>
              <ImageField
                label="Social share image"
                hint="Used for link previews. Leave empty to use the hero portrait."
                imageId={draft.settings.ogImage}
                onChange={(id) =>
                  patch((content) => {
                    content.settings.ogImage = id;
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#D7E2EA]/60">
                  Navigation links
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    patch((content) => {
                      content.settings.navLinks = [
                        ...content.settings.navLinks,
                        { id: newId("nav"), label: "New", href: "/" },
                      ];
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add link
                </Button>
              </div>

              <ul className="flex flex-col gap-2">
                {draft.settings.navLinks.map((link, index) => (
                  <li key={link.id} className="flex items-center gap-2">
                    <TextInput
                      className="max-w-[150px]"
                      value={link.label}
                      aria-label="Link label"
                      onChange={(event) =>
                        patch((content) => {
                          const item = content.settings.navLinks.find(
                            (entry) => entry.id === link.id,
                          );
                          if (item) item.label = event.target.value;
                        })
                      }
                    />
                    <TextInput
                      value={link.href}
                      aria-label="Link destination"
                      placeholder="/about"
                      onChange={(event) =>
                        patch((content) => {
                          const item = content.settings.navLinks.find(
                            (entry) => entry.id === link.id,
                          );
                          if (item) item.href = event.target.value;
                        })
                      }
                    />
                    <IconButton
                      label="Move up"
                      disabled={index === 0}
                      onClick={() =>
                        patch((content) => {
                          content.settings.navLinks = move(content.settings.navLinks, index, -1);
                        })
                      }
                    >
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label="Move down"
                      disabled={index === draft.settings.navLinks.length - 1}
                      onClick={() =>
                        patch((content) => {
                          content.settings.navLinks = move(content.settings.navLinks, index, 1);
                        })
                      }
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label="Remove link"
                      onClick={() =>
                        patch((content) => {
                          content.settings.navLinks = content.settings.navLinks.filter(
                            (entry) => entry.id !== link.id,
                          );
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel title="Preview" description="Renders your unsaved draft in the real site.">
        <PreviewFrame height="60vh" />
      </Panel>

      <SaveBar scope="Website content" />

      {dirty ? (
        <div className="flex justify-center">
          <Button type="button" variant="primary" onClick={() => void handleSave()}>
            Save changes
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- previews -- */

function MarqueeEditor() {
  const { draft, update, library } = useSiteContent();
  const [picking, setPicking] = useState<{ row: 1 | 2; index: number } | null>(null);

  const rows = [
    { key: "rowOne" as const, label: "Row one" },
    { key: "rowTwo" as const, label: "Row two" },
  ];

  return (
    <Panel
      title="Preview strip"
      description="The two scrolling rows under the hero. Reorder, replace or remove any tile."
      actions={
        <>
          {rows.map((row) => (
            <Button
              key={row.key}
              type="button"
              size="sm"
              onClick={() =>
                update((content) => {
                  const next = [...content.marquee[row.key]];
                  const firstUnused = library.find(
                    (asset) => !content.marquee[row.key].includes(asset.id),
                  );
                  if (firstUnused) next.push(firstUnused.id);
                  content.marquee[row.key] = next;
                })
              }
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add to {row.label.toLowerCase()}
            </Button>
          ))}
        </>
      }
    >
      <Field label="Section label" htmlFor="marquee-title">
        <TextInput
          id="marquee-title"
          value={draft.marquee.title}
          maxLength={60}
          onChange={(event) =>
            update((content) => {
              content.marquee.title = event.target.value;
            })
          }
        />
      </Field>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {rows.map((row) => (
          <section key={row.key} aria-label={row.label}>
            <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#D7E2EA]/60">
              {row.label} · {draft.marquee[row.key].length} tiles
            </p>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {draft.marquee[row.key].map((id, index) => {
                const asset = library.find((entry) => entry.id === id);
                return (
                  <li
                    key={`${row.key}-${id}-${index}`}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40"
                  >
                    <img
                      src={asset?.src ?? ""}
                      alt={asset?.alt ?? "Preview tile"}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-1 border-t border-white/10 bg-black/50 px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          update((content) => {
                            const list = [...content.marquee[row.key]];
                            const target = index - 1;
                            if (target < 0) return;
                            [list[index], list[target]] = [list[target], list[index]];
                            content.marquee[row.key] = list;
                          })
                        }
                        className="rounded p-1 text-[#D7E2EA]/60 hover:bg-white/10 hover:text-white disabled:opacity-25"
                        aria-label={`Move ${asset?.alt ?? "tile"} left`}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          update((content) => {
                            const list = [...content.marquee[row.key]];
                            const target = index + 1;
                            if (target >= list.length) return;
                            [list[index], list[target]] = [list[target], list[index]];
                            content.marquee[row.key] = list;
                          })
                        }
                        className="rounded p-1 text-[#D7E2EA]/60 hover:bg-white/10 hover:text-white disabled:opacity-25"
                        aria-label={`Move ${asset?.alt ?? "tile"} right`}
                        disabled={index === draft.marquee[row.key].length - 1}
                      >
                        <ChevronDown className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-1 px-1.5 pb-1.5">
                      <button
                        type="button"
                        onClick={() => setPicking({ row: row.key === "rowOne" ? 1 : 2, index })}
                        className="truncate text-[0.6rem] uppercase tracking-[0.1em] text-[#D7E2EA]/50 hover:text-[#D7E2EA]"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          update((content) => {
                            content.marquee[row.key] = content.marquee[row.key].filter(
                              (_, position) => position !== index,
                            );
                          })
                        }
                        className="rounded p-1 text-[#D7E2EA]/50 hover:bg-white/10 hover:text-white"
                        aria-label={`Remove ${asset?.alt ?? "tile"}`}
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <ImagePicker
        open={picking !== null}
        onClose={() => setPicking(null)}
        current={picking ? draft.marquee[picking.row === 1 ? "rowOne" : "rowTwo"][picking.index] : undefined}
        title="Choose a preview tile"
        onSelect={(id) => {
          if (!picking || !id) return;
          update((content) => {
            const list = [...content.marquee[picking.row === 1 ? "rowOne" : "rowTwo"]];
            list[picking.index] = id;
            content.marquee[picking.row === 1 ? "rowOne" : "rowTwo"] = list;
          });
        }}
      />
    </Panel>
  );
}

/* ---------------------------------------------------------------- pricing -- */

function PricingEditor({ onSave }: { onSave: () => void }) {
  const { draft, update } = useSiteContent();

  const addTier = () => {
    const tier: PricingTier = {
      id: newId("tier"),
      title: "New package",
      price: "",
      period: "",
      description: "",
      features: [],
      ctaText: "Enquire",
      ctaHref: "/contact",
      highlighted: false,
      visible: true,
    };
    update((content) => {
      content.pricing.tiers = [...content.pricing.tiers, tier];
    });
  };

  return (
    <Panel
      title="Pricing"
      description="Add packages and they appear on the /pricing page. Until then the page stays exactly as it is."
      actions={
        <Button type="button" size="sm" onClick={addTier}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add package
        </Button>
      }
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Heading" htmlFor="pricing-title">
          <TextInput
            id="pricing-title"
            value={draft.pricing.title}
            maxLength={40}
            onChange={(event) =>
              update((content) => {
                content.pricing.title = event.target.value;
              })
            }
          />
        </Field>
        <Field label="Intro line" htmlFor="pricing-subtitle">
          <TextInput
            id="pricing-subtitle"
            value={draft.pricing.subtitle}
            maxLength={160}
            onChange={(event) =>
              update((content) => {
                content.pricing.subtitle = event.target.value;
              })
            }
          />
        </Field>
        <Field label="Footnote" htmlFor="pricing-note">
          <TextInput
            id="pricing-note"
            value={draft.pricing.note}
            maxLength={160}
            onChange={(event) =>
              update((content) => {
                content.pricing.note = event.target.value;
              })
            }
          />
        </Field>
      </div>

      {draft.pricing.tiers.length ? (
        <ul className="mt-6 flex flex-col gap-4">
          {draft.pricing.tiers.map((tier, index) => (
            <li key={tier.id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge tone={tier.visible ? "accent" : "warn"}>
                  {tier.visible ? `Package ${index + 1}` : "Hidden"}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <IconButton
                    label="Move up"
                    disabled={index === 0}
                    onClick={() =>
                      update((content) => {
                        content.pricing.tiers = move(content.pricing.tiers, index, -1);
                      })
                    }
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    disabled={index === draft.pricing.tiers.length - 1}
                    onClick={() =>
                      update((content) => {
                        content.pricing.tiers = move(content.pricing.tiers, index, 1);
                      })
                    }
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={tier.visible ? "Hide package" : "Show package"}
                    onClick={() =>
                      update((content) => {
                        const item = content.pricing.tiers.find((entry) => entry.id === tier.id);
                        if (item) item.visible = !item.visible;
                      })
                    }
                  >
                    {tier.visible ? (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    )}
                  </IconButton>
                  <IconButton
                    label="Delete package"
                    onClick={() =>
                      update((content) => {
                        content.pricing.tiers = content.pricing.tiers.filter(
                          (entry) => entry.id !== tier.id,
                        );
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Title" htmlFor={`tier-${tier.id}-title`}>
                  <TextInput
                    id={`tier-${tier.id}-title`}
                    value={tier.title}
                    maxLength={40}
                    onChange={(event) =>
                      update((content) => {
                        const item = content.pricing.tiers.find((entry) => entry.id === tier.id);
                        if (item) item.title = event.target.value;
                      })
                    }
                  />
                </Field>
                <Field label="Price" htmlFor={`tier-${tier.id}-price`}>
                  <TextInput
                    id={`tier-${tier.id}-price`}
                    value={tier.price}
                    placeholder="৳1.5L"
                    maxLength={24}
                    onChange={(event) =>
                      update((content) => {
                        const item = content.pricing.tiers.find((entry) => entry.id === tier.id);
                        if (item) item.price = event.target.value;
                      })
                    }
                  />
                </Field>
                <Field label="Period" htmlFor={`tier-${tier.id}-period`}>
                  <TextInput
                    id={`tier-${tier.id}-period`}
                    value={tier.period}
                    placeholder="per project"
                    maxLength={24}
                    onChange={(event) =>
                      update((content) => {
                        const item = content.pricing.tiers.find((entry) => entry.id === tier.id);
                        if (item) item.period = event.target.value;
                      })
                    }
                  />
                </Field>
                <Field label="Button text" htmlFor={`tier-${tier.id}-cta`}>
                  <TextInput
                    id={`tier-${tier.id}-cta`}
                    value={tier.ctaText}
                    maxLength={30}
                    onChange={(event) =>
                      update((content) => {
                        const item = content.pricing.tiers.find((entry) => entry.id === tier.id);
                        if (item) item.ctaText = event.target.value;
                      })
                    }
                  />
                </Field>
              </div>

              <Field className="mt-4" label="Description" htmlFor={`tier-${tier.id}-description`}>
                <TextArea
                  id={`tier-${tier.id}-description`}
                  rows={2}
                  maxLength={280}
                  value={tier.description}
                  onChange={(event) =>
                    update((content) => {
                      const item = content.pricing.tiers.find((entry) => entry.id === tier.id);
                      if (item) item.description = event.target.value;
                    })
                  }
                />
              </Field>

              <Field
                className="mt-4"
                label="Features"
                htmlFor={`tier-${tier.id}-features`}
                hint="One feature per line, added with Enter."
              >
                <TagInput
                  id={`tier-${tier.id}-features`}
                  label="Features"
                  values={tier.features}
                  onChange={(next) =>
                    update((content) => {
                      const item = content.pricing.tiers.find((entry) => entry.id === tier.id);
                      if (item) item.features = next;
                    })
                  }
                />
              </Field>

              <Toggle
                className="mt-4"
                label="Highlight this package"
                checked={tier.highlighted}
                onChange={(next) =>
                  update((content) => {
                    const item = content.pricing.tiers.find((entry) => entry.id === tier.id);
                    if (item) item.highlighted = next;
                  })
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 flex items-center gap-2 text-sm text-[#D7E2EA]/45">
          <Settings2 className="h-4 w-4" aria-hidden="true" />
          No packages yet — the pricing page shows the services section only, exactly as before.
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <Button type="button" variant="primary" onClick={onSave}>
          Save pricing
        </Button>
      </div>
    </Panel>
  );
}
