import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useSiteContent } from "../../content/SiteContentProvider";
import { newId } from "../../content/resolve";
import type { ProjectImageSlot, ProjectItem } from "../../content/types";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  IconButton,
  Panel,
  TagInput,
  TextArea,
  TextInput,
  Toggle,
  useToast,
} from "../ui";
import ImageField from "../components/ImageField";
import ImagePicker from "../components/ImagePicker";
import SaveBar from "../components/SaveBar";

const SLOT_LABELS: Array<{ slot: ProjectImageSlot; label: string; hint: string }> = [
  { slot: "a", label: "Main image A", hint: "Top-left tile on the project card." },
  { slot: "b", label: "Main image B", hint: "Bottom-left tile on the project card." },
  { slot: "c", label: "Main image C", hint: "Tall image on the right of the card." },
  { slot: "extra", label: "Gallery image", hint: "Appears in the gallery strip under the card." },
];

const move = <T,>(list: T[], index: number, delta: number): T[] => {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return list;
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
};

/**
 * Projects editor.
 *
 * The card layout is untouched — each project still owns three tiles (A, B, C)
 * plus any number of extra gallery images, and reordering, hiding and editing
 * all happen in the content document.
 */
export default function ProjectsPage() {
  const { draft, update, save, dirty } = useSiteContent();
  const { push } = useToast();
  const [openId, setOpenId] = useState<string | null>(draft.projects.items[0]?.id ?? null);
  const [pendingDelete, setPendingDelete] = useState<ProjectItem | null>(null);
  const [picking, setPicking] = useState<{ projectId: string; imageId: string } | null>(null);

  const projects = draft.projects.items;

  const addProject = () => {
    const project: ProjectItem = {
      id: newId("project"),
      number: String(projects.length + 1).padStart(2, "0"),
      name: "New project",
      category: "Category",
      description: "",
      info: [{ id: newId("info"), label: "Scope", value: "" }],
      technologies: [],
      url: "",
      ctaText: "Live Project",
      images: [],
      visible: false,
    };
    update((content) => {
      content.projects.items = [...content.projects.items, project];
    });
    setOpenId(project.id);
  };

  const patchProject = (id: string, mutate: (project: ProjectItem) => void) =>
    update((content) => {
      const project = content.projects.items.find((entry) => entry.id === id);
      if (project) mutate(project);
    });

  return (
    <div className="flex flex-col gap-5">
      <Panel
        title="Projects"
        description="Edit the projects on the portfolio, reorder them, or hide one without deleting it."
        actions={
          <>
            <Button type="button" size="sm" onClick={addProject}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add project
            </Button>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Section heading" htmlFor="projects-title">
            <TextInput
              id="projects-title"
              value={draft.projects.title}
              maxLength={40}
              onChange={(event) =>
                update((content) => {
                  content.projects.title = event.target.value;
                })
              }
            />
          </Field>
          <Field label="Intro line" htmlFor="projects-subtitle">
            <TextInput
              id="projects-subtitle"
              value={draft.projects.subtitle}
              maxLength={160}
              placeholder="Optional line under the heading"
              onChange={(event) =>
                update((content) => {
                  content.projects.subtitle = event.target.value;
                })
              }
            />
          </Field>
        </div>
      </Panel>

      {projects.length ? (
        <ul className="flex flex-col gap-4">
          {projects.map((project, index) => {
            const isOpen = openId === project.id;

            return (
              <li
                key={project.id}
                className="glass-card overflow-hidden rounded-[28px] border border-white/10"
              >
                <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    <ProjectThumb project={project} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-[#D7E2EA]/35">{project.number}</span>
                      <span className="truncate text-sm font-medium text-[#D7E2EA]">
                        {project.name}
                      </span>
                      {project.visible ? (
                        <Badge tone="good">Visible</Badge>
                      ) : (
                        <Badge tone="warn">Hidden</Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-[#D7E2EA]/45">
                      {project.category || "No category"} ·{" "}
                      {project.images.filter((image) => image.slot !== "extra").length} card image(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <IconButton
                      label="Move project up"
                      disabled={index === 0}
                      onClick={() =>
                        update((content) => {
                          content.projects.items = move(content.projects.items, index, -1);
                        })
                      }
                    >
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label="Move project down"
                      disabled={index === projects.length - 1}
                      onClick={() =>
                        update((content) => {
                          content.projects.items = move(content.projects.items, index, 1);
                        })
                      }
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label={project.visible ? "Hide project" : "Show project"}
                      onClick={() => patchProject(project.id, (item) => (item.visible = !item.visible))}
                    >
                      {project.visible ? (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      )}
                    </IconButton>
                    <IconButton
                      label={isOpen ? "Close editor" : "Open editor"}
                      onClick={() => setOpenId(isOpen ? null : project.id)}
                    >
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      )}
                    </IconButton>
                    <IconButton label="Delete project" onClick={() => setPendingDelete(project)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>

                {isOpen ? (
                  <div className="border-t border-white/10 bg-white/[0.02] p-4 sm:p-5">
                    <div className="grid gap-5 lg:grid-cols-2">
                      <div className="flex flex-col gap-5">
                        <div className="grid gap-4 sm:grid-cols-[90px_1fr]">
                          <Field label="Number" htmlFor={`${project.id}-number`}>
                            <TextInput
                              id={`${project.id}-number`}
                              value={project.number}
                              maxLength={4}
                              onChange={(event) =>
                                patchProject(project.id, (item) => {
                                  item.number = event.target.value;
                                })
                              }
                            />
                          </Field>
                          <Field label="Title" htmlFor={`${project.id}-name`} required>
                            <TextInput
                              id={`${project.id}-name`}
                              value={project.name}
                              maxLength={60}
                              onChange={(event) =>
                                patchProject(project.id, (item) => {
                                  item.name = event.target.value;
                                })
                              }
                            />
                          </Field>
                        </div>

                        <Field label="Category" htmlFor={`${project.id}-category`}>
                          <TextInput
                            id={`${project.id}-category`}
                            value={project.category}
                            maxLength={40}
                            onChange={(event) =>
                              patchProject(project.id, (item) => {
                                item.category = event.target.value;
                              })
                            }
                          />
                        </Field>

                        <Field label="Description" htmlFor={`${project.id}-description`}>
                          <TextArea
                            id={`${project.id}-description`}
                            rows={4}
                            maxLength={700}
                            value={project.description}
                            onChange={(event) =>
                              patchProject(project.id, (item) => {
                                item.description = event.target.value;
                              })
                            }
                          />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Button text" htmlFor={`${project.id}-cta`}>
                            <TextInput
                              id={`${project.id}-cta`}
                              value={project.ctaText}
                              maxLength={30}
                              onChange={(event) =>
                                patchProject(project.id, (item) => {
                                  item.ctaText = event.target.value;
                                })
                              }
                            />
                          </Field>
                          <Field
                            label="Project URL"
                            htmlFor={`${project.id}-url`}
                            hint="Leave empty to link to /projects."
                          >
                            <TextInput
                              id={`${project.id}-url`}
                              value={project.url}
                              placeholder="https://…"
                              onChange={(event) =>
                                patchProject(project.id, (item) => {
                                  item.url = event.target.value;
                                })
                              }
                            />
                          </Field>
                        </div>

                        <Field label="Technologies" htmlFor={`${project.id}-tech`}>
                          <TagInput
                            id={`${project.id}-tech`}
                            label="Technologies"
                            values={project.technologies}
                            onChange={(next) =>
                              patchProject(project.id, (item) => {
                                item.technologies = next;
                              })
                            }
                          />
                        </Field>

                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#D7E2EA]/60">
                              Project information
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                patchProject(project.id, (item) => {
                                  item.info = [...item.info, { id: newId("info"), label: "", value: "" }];
                                })
                              }
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                              Add row
                            </Button>
                          </div>
                          {project.info.length ? (
                            <ul className="flex flex-col gap-2">
                              {project.info.map((row) => (
                                <li key={row.id} className="flex items-center gap-2">
                                  <TextInput
                                    className="max-w-[150px]"
                                    value={row.label}
                                    placeholder="Client"
                                    aria-label="Information label"
                                    onChange={(event) =>
                                      patchProject(project.id, (item) => {
                                        const target = item.info.find((entry) => entry.id === row.id);
                                        if (target) target.label = event.target.value;
                                      })
                                    }
                                  />
                                  <TextInput
                                    value={row.value}
                                    placeholder="Value"
                                    aria-label="Information value"
                                    onChange={(event) =>
                                      patchProject(project.id, (item) => {
                                        const target = item.info.find((entry) => entry.id === row.id);
                                        if (target) target.value = event.target.value;
                                      })
                                    }
                                  />
                                  <IconButton
                                    label="Remove row"
                                    onClick={() =>
                                      patchProject(project.id, (item) => {
                                        item.info = item.info.filter((entry) => entry.id !== row.id);
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
                              Client, year, role — any label/value rows you want on record.
                            </p>
                          )}
                        </div>

                        <Toggle
                          label="Show this project"
                          description="Hidden projects stay in the editor but disappear from the site."
                          checked={project.visible}
                          onChange={(next) =>
                            patchProject(project.id, (item) => {
                              item.visible = next;
                            })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        {SLOT_LABELS.filter((entry) => entry.slot !== "extra").map((entry) => {
                          const image = project.images.find((item) => item.slot === entry.slot);
                          return (
                            <ImageField
                              key={entry.slot}
                              label={entry.label}
                              hint={entry.hint}
                              imageId={image?.image ?? ""}
                              alt={image?.alt ?? ""}
                              onAltChange={(alt) =>
                                patchProject(project.id, (item) => {
                                  const target = item.images.find(
                                    (entryImage) => entryImage.id === image?.id,
                                  );
                                  if (target) target.alt = alt;
                                })
                              }
                              onChange={(id) =>
                                patchProject(project.id, (item) => {
                                  const existing = item.images.find(
                                    (entryImage) => entryImage.slot === entry.slot,
                                  );
                                  if (existing) {
                                    existing.image = id;
                                  } else if (id) {
                                    item.images.push({
                                      id: newId("img"),
                                      image: id,
                                      alt: "",
                                      slot: entry.slot,
                                    });
                                  }
                                })
                              }
                            />
                          );
                        })}

                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#D7E2EA]/60">
                              Gallery images
                            </p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  patchProject(project.id, (item) => {
                                    item.images.push({
                                      id: newId("img"),
                                      image: "",
                                      alt: "",
                                      slot: "extra",
                                    });
                                  })
                                }
                              >
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                Add slot
                              </Button>
                              {picking?.projectId === project.id ? null : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setPicking({ projectId: project.id, imageId: "" })}
                                >
                                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                                  Add from library
                                </Button>
                              )}
                            </div>
                          </div>

                          {project.images.filter((image) => image.slot === "extra").length ? (
                            <ul className="flex flex-col gap-2">
                              {project.images
                                .filter((image) => image.slot === "extra")
                                .map((image) => {
                                  const position = project.images.indexOf(image);
                                  return (
                                    <li
                                      key={image.id}
                                      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2"
                                    >
                                      <GalleryThumb project={project} imageId={image.image} />
                                      <TextInput
                                        value={image.alt}
                                        placeholder="Alt text"
                                        aria-label="Gallery alt text"
                                        onChange={(event) =>
                                          patchProject(project.id, (item) => {
                                            const target = item.images.find(
                                              (entry) => entry.id === image.id,
                                            );
                                            if (target) target.alt = event.target.value;
                                          })
                                        }
                                      />
                                      <IconButton
                                        label="Move image earlier"
                                        disabled={position <= 3}
                                        onClick={() =>
                                          patchProject(project.id, (item) => {
                                            item.images = move(item.images, position, -1);
                                          })
                                        }
                                      >
                                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                                      </IconButton>
                                      <IconButton
                                        label="Move image later"
                                        onClick={() =>
                                          patchProject(project.id, (item) => {
                                            item.images = move(item.images, position, 1);
                                          })
                                        }
                                      >
                                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                      </IconButton>
                                      <IconButton
                                        label="Remove image"
                                        onClick={() =>
                                          patchProject(project.id, (item) => {
                                            item.images = item.images.filter(
                                              (entry) => entry.id !== image.id,
                                            );
                                          })
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                      </IconButton>
                                    </li>
                                  );
                                })}
                            </ul>
                          ) : (
                            <p className="text-xs text-[#D7E2EA]/40">
                              Add gallery images to show a strip under the card.
                            </p>
                          )}
                        </div>

                        {project.images.some((image) => !image.image) ? (
                          <Alert tone="warn">
                            One of the gallery slots has no image yet. Empty slots fall back to the
                            hero portrait until you pick one.
                          </Alert>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          title="No projects yet"
          description="Add a project to show it on the portfolio."
          action={
            <Button type="button" onClick={addProject}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add project
            </Button>
          }
        />
      )}

      <ImagePicker
        open={picking !== null}
        onClose={() => setPicking(null)}
        current={picking?.imageId || undefined}
        title="Add a gallery image"
        onSelect={(id) => {
          if (!picking || !id) return;
          patchProject(picking.projectId, (item) => {
            item.images.push({ id: newId("img"), image: id, alt: "", slot: "extra" });
          });
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this project?"
        confirmLabel="Delete project"
        busy={false}
        message={
          <>
            “{pendingDelete?.name}” and its images will be removed from the site. This only affects
            the published copy once you save. This cannot be undone.
          </>
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          update((content) => {
            content.projects.items = content.projects.items.filter(
              (entry) => entry.id !== pendingDelete.id,
            );
          });
          setPendingDelete(null);
          push("Project removed. Remember to save to publish.", "info");
        }}
      />

      <SaveBar scope="Projects" />

      {dirty ? (
        <div className="flex justify-center">
          <Button type="button" variant="primary" onClick={() => void save().then((result) => push(result.message, result.ok ? "success" : "error"))}>
            Save projects
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ thumbs -- */

function ProjectThumb({ project }: { project: ProjectItem }) {
  const { library } = useSiteContent();
  const id = project.images.find((image) => image.slot === "a")?.image
    ?? project.images[0]?.image
    ?? "";
  const asset = library.find((entry) => entry.id === id);

  return asset ? (
    <img
      src={asset.src}
      alt={`${project.name} thumbnail`}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover"
    />
  ) : (
    <span className="flex h-full w-full items-center justify-center text-xs text-[#D7E2EA]/30">
      No image
    </span>
  );
}

function GalleryThumb({ project, imageId }: { project: ProjectItem; imageId: string }) {
  const { library } = useSiteContent();
  const asset = library.find((entry) => entry.id === imageId);
  return asset ? (
    <img
      src={asset.src}
      alt={`${project.name} gallery preview`}
      loading="lazy"
      decoding="async"
      className="h-12 w-16 shrink-0 rounded-lg object-cover"
    />
  ) : (
    <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[0.6rem] uppercase tracking-[0.1em] text-[#D7E2EA]/35">
      Empty
    </span>
  );
}
