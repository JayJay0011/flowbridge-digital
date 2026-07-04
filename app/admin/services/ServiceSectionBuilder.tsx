"use client";

export type EditableServiceSectionItem = {
  title: string;
  body: string;
};

export type EditableServiceSection = {
  title: string;
  body: string;
  variant: "white" | "light" | "dark";
  columns: 1 | 2 | 4;
  items: EditableServiceSectionItem[];
};

type StoredServiceSection = {
  title?: string;
  body?: string;
  variant?: "white" | "light" | "dark";
  columns?: 1 | 2 | 4;
  items?: Array<string | { title?: string; body?: string }>;
};

type ServiceSectionBuilderProps = {
  value: EditableServiceSection[];
  onChange: (sections: EditableServiceSection[]) => void;
};

const emptySection = (): EditableServiceSection => ({
  title: "",
  body: "",
  variant: "white",
  columns: 1,
  items: [],
});

const emptyItem = (): EditableServiceSectionItem => ({
  title: "",
  body: "",
});

export function createServicePageTemplate(): EditableServiceSection[] {
  return [
    {
      title: "When This Problem Slows Growth",
      body: "",
      variant: "white",
      columns: 1,
      items: [
        { title: "", body: "Disconnected tools create manual follow-up." },
        { title: "", body: "Important client or lead details sit in different places." },
        { title: "", body: "The team has no clear system for visibility and accountability." },
      ],
    },
    {
      title: "What We Build",
      body: "",
      variant: "light",
      columns: 2,
      items: [
        {
          title: "Structured system setup",
          body: "A clear operating layer built around your business workflow.",
        },
        {
          title: "Automation and integrations",
          body: "Connected tools that reduce repetitive admin work and missed steps.",
        },
      ],
    },
    {
      title: "Our Implementation Process",
      body: "",
      variant: "white",
      columns: 1,
      items: [
        {
          title: "1. System audit",
          body: "We map the current process, tools, gaps, and business goals.",
        },
        {
          title: "2. Build and connect",
          body: "We configure the core system, integrations, automations, and dashboards.",
        },
        {
          title: "3. Test and hand off",
          body: "We validate the workflow and provide clear handoff for daily use.",
        },
      ],
    },
    {
      title: "Tools and Stack",
      body: "",
      variant: "light",
      columns: 4,
      items: [
        { title: "CRM", body: "Pipeline, client records, and reporting." },
        { title: "Automation", body: "Zapier, Make, n8n, and webhook flows." },
        { title: "Data", body: "Airtable, Supabase, sheets, and structured records." },
        { title: "Delivery", body: "Dashboards, portals, and process visibility." },
      ],
    },
    {
      title: "Expected Outcomes",
      body: "",
      variant: "dark",
      columns: 2,
      items: [
        { title: "Less manual work", body: "Routine steps run through a repeatable system." },
        { title: "More visibility", body: "Your team can see status, ownership, and next steps." },
      ],
    },
  ];
}

export function toEditableServiceSections(
  sections: StoredServiceSection[] | null | undefined
): EditableServiceSection[] {
  if (!Array.isArray(sections)) return [];

  return sections.map((section) => ({
    title: section.title ?? "",
    body: section.body ?? "",
    variant:
      section.variant === "dark" || section.variant === "light"
        ? section.variant
        : "white",
    columns:
      section.columns === 2 || section.columns === 4 ? section.columns : 1,
    items: Array.isArray(section.items)
      ? section.items.map((item) =>
          typeof item === "string"
            ? { title: "", body: item }
            : { title: item.title ?? "", body: item.body ?? "" }
        )
      : [],
  }));
}

export function sanitizeServiceSections(sections: EditableServiceSection[]) {
  return sections
    .map((section) => {
      const items = section.items
        .map((item) => ({
          title: item.title.trim(),
          body: item.body.trim(),
        }))
        .filter((item) => item.title || item.body)
        .map((item) =>
          item.title ? item : item.body
        );

      return {
        title: section.title.trim(),
        body: section.body.trim() || undefined,
        variant: section.variant,
        columns: section.columns,
        items,
      };
    })
    .filter((section) => section.title || section.body || section.items.length);
}

export default function ServiceSectionBuilder({
  value,
  onChange,
}: ServiceSectionBuilderProps) {
  const updateSection = (
    index: number,
    changes: Partial<EditableServiceSection>
  ) => {
    onChange(
      value.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...changes } : section
      )
    );
  };

  const updateItem = (
    sectionIndex: number,
    itemIndex: number,
    changes: Partial<EditableServiceSectionItem>
  ) => {
    onChange(
      value.map((section, currentSectionIndex) => {
        if (currentSectionIndex !== sectionIndex) return section;
        return {
          ...section,
          items: section.items.map((item, currentItemIndex) =>
            currentItemIndex === itemIndex ? { ...item, ...changes } : item
          ),
        };
      })
    );
  };

  const removeSection = (index: number) => {
    onChange(value.filter((_, sectionIndex) => sectionIndex !== index));
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    onChange(
      value.map((section, currentSectionIndex) => {
        if (currentSectionIndex !== sectionIndex) return section;
        return {
          ...section,
          items: section.items.filter(
            (_, currentItemIndex) => currentItemIndex !== itemIndex
          ),
        };
      })
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Page layout sections</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add the same type of sections used on the current service pages. No JSON needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange(createServicePageTemplate())}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Use layout template
          </button>
          <button
            type="button"
            onClick={() => onChange([...value, emptySection()])}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add section
          </button>
        </div>
      </div>

      {value.length ? (
        <div className="space-y-5">
          {value.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">
                  Section {sectionIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeSection(sectionIndex)}
                  className="text-sm font-semibold text-red-600"
                >
                  Remove
                </button>
              </div>

              <div>
                <label className="text-sm font-semibold">Section title</label>
                <input
                  value={section.title}
                  onChange={(event) =>
                    updateSection(sectionIndex, { title: event.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="What We Build"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Intro text optional
                </label>
                <textarea
                  value={section.body}
                  onChange={(event) =>
                    updateSection(sectionIndex, { body: event.target.value })
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Short paragraph for this section"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Section style</label>
                  <select
                    value={section.variant}
                    onChange={(event) =>
                      updateSection(sectionIndex, {
                        variant: event.target.value as EditableServiceSection["variant"],
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <option value="white">White</option>
                    <option value="light">Light grey</option>
                    <option value="dark">Dark outcomes</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Item columns</label>
                  <select
                    value={section.columns}
                    onChange={(event) =>
                      updateSection(sectionIndex, {
                        columns: Number(event.target.value) as EditableServiceSection["columns"],
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <option value={1}>1 column</option>
                    <option value={2}>2 columns</option>
                    <option value={4}>4 columns</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Items</label>
                  <button
                    type="button"
                    onClick={() =>
                      updateSection(sectionIndex, {
                        items: [...section.items, emptyItem()],
                      })
                    }
                    className="text-sm font-semibold text-slate-700"
                  >
                    Add item
                  </button>
                </div>

                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_2fr_auto]"
                  >
                    <input
                      value={item.title}
                      onChange={(event) =>
                        updateItem(sectionIndex, itemIndex, {
                          title: event.target.value,
                        })
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2"
                      placeholder="Item title optional"
                    />
                    <input
                      value={item.body}
                      onChange={(event) =>
                        updateItem(sectionIndex, itemIndex, {
                          body: event.target.value,
                        })
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2"
                      placeholder="Item detail"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(sectionIndex, itemIndex)}
                      className="text-sm font-semibold text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          No sections yet. Use the layout template to start with the same structure as the live service pages.
        </div>
      )}
    </div>
  );
}
