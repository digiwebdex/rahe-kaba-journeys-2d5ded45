import { useState, useEffect } from "react";
import { useAllSiteContent, useUpdateSiteContent } from "@/hooks/useSiteContent";
import { Save, Plus, Trash2, ChevronDown, ChevronUp, Type, FileText, Globe, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

const SECTION_CONFIG: Record<string, { label: string; icon: any; fields: FieldConfig[] }> = {
  hero: {
    label: "Hero Section",
    icon: Type,
    fields: [
      { key: "badge", label: "Badge Text", type: "text" },
      { key: "heading_line1", label: "Heading Line 1", type: "text" },
      { key: "heading_line2", label: "Heading Line 2", type: "text" },
      { key: "heading_highlight", label: "Heading Highlight", type: "text" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      { key: "cta_primary", label: "Primary Button Text", type: "text" },
      { key: "cta_secondary", label: "Secondary Button Text", type: "text" },
      { key: "stats", label: "Stats", type: "array", arrayFields: [
        { key: "value", label: "Value", type: "text" },
        { key: "label", label: "Label", type: "text" },
      ]},
    ],
  },
  services: {
    label: "Services Section",
    icon: Globe,
    fields: [
      { key: "section_label", label: "Section Label", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "heading_highlight", label: "Heading Highlight", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "items", label: "Service Items", type: "array", arrayFields: [
        { key: "icon", label: "Icon Name", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "desc", label: "Description", type: "text" },
      ]},
    ],
  },
  about: {
    label: "About Section",
    icon: FileText,
    fields: [
      { key: "section_label", label: "Section Label", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "heading_highlight", label: "Heading Highlight", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "reasons", label: "Reasons", type: "array", arrayFields: [
        { key: "title", label: "Title", type: "text" },
        { key: "desc", label: "Description", type: "text" },
      ]},
    ],
  },
  contact: {
    label: "Contact Section",
    icon: Phone,
    fields: [
      { key: "section_label", label: "Section Label", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "heading_highlight", label: "Heading Highlight", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "hours", label: "Working Hours", type: "text" },
    ],
  },
  footer: {
    label: "Footer",
    icon: MapPin,
    fields: [
      { key: "company_name", label: "Company Name", type: "text" },
      { key: "company_tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "address", label: "Address", type: "text" },
      { key: "services_list", label: "Services List", type: "string_array" },
      { key: "developer_name", label: "Developer Name", type: "text" },
      { key: "developer_url", label: "Developer URL", type: "text" },
    ],
  },
  navbar: {
    label: "Navbar",
    icon: Globe,
    fields: [
      { key: "phone", label: "Phone Number", type: "text" },
      { key: "cta_text", label: "CTA Button Text", type: "text" },
    ],
  },
};

interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "array" | "string_array";
  arrayFields?: { key: string; label: string; type: string }[];
}

const AdminCmsEditor = () => {
  const { data: allContent, isLoading } = useAllSiteContent();
  const updateMutation = useUpdateSiteContent();
  const [editState, setEditState] = useState<Record<string, any>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>("hero");

  useEffect(() => {
    if (allContent) {
      setEditState({ ...allContent });
    }
  }, [allContent]);

  const handleFieldChange = (section: string, key: string, value: any) => {
    setEditState((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleArrayItemChange = (section: string, arrayKey: string, index: number, fieldKey: string, value: string) => {
    setEditState((prev) => {
      const arr = [...(prev[section]?.[arrayKey] || [])];
      arr[index] = { ...arr[index], [fieldKey]: value };
      return { ...prev, [section]: { ...prev[section], [arrayKey]: arr } };
    });
  };

  const handleAddArrayItem = (section: string, arrayKey: string, fields: { key: string }[]) => {
    setEditState((prev) => {
      const arr = [...(prev[section]?.[arrayKey] || [])];
      const newItem: any = {};
      fields.forEach((f) => (newItem[f.key] = ""));
      arr.push(newItem);
      return { ...prev, [section]: { ...prev[section], [arrayKey]: arr } };
    });
  };

  const handleRemoveArrayItem = (section: string, arrayKey: string, index: number) => {
    setEditState((prev) => {
      const arr = [...(prev[section]?.[arrayKey] || [])];
      arr.splice(index, 1);
      return { ...prev, [section]: { ...prev[section], [arrayKey]: arr } };
    });
  };

  const handleStringArrayChange = (section: string, key: string, value: string) => {
    const arr = value.split("\n").filter(Boolean);
    handleFieldChange(section, key, arr);
  };

  const handleSave = (sectionKey: string) => {
    updateMutation.mutate({ sectionKey, content: editState[sectionKey] });
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-12">Loading content...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-lg font-bold">Website Content Manager</h3>
        <p className="text-xs text-muted-foreground">Edit all website sections from here</p>
      </div>

      {Object.entries(SECTION_CONFIG).map(([sectionKey, config]) => {
        const isExpanded = expandedSection === sectionKey;
        const sectionData = editState[sectionKey] || {};
        const hasChanges = JSON.stringify(sectionData) !== JSON.stringify(allContent?.[sectionKey]);

        return (
          <div key={sectionKey} className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <config.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{config.fields.length} editable fields</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Unsaved</span>
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border p-5 space-y-4">
                {config.fields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">{field.label}</label>

                    {field.type === "text" && (
                      <input
                        className={inputClass}
                        value={sectionData[field.key] || ""}
                        onChange={(e) => handleFieldChange(sectionKey, field.key, e.target.value)}
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        className={inputClass}
                        rows={3}
                        value={sectionData[field.key] || ""}
                        onChange={(e) => handleFieldChange(sectionKey, field.key, e.target.value)}
                      />
                    )}

                    {field.type === "string_array" && (
                      <textarea
                        className={inputClass}
                        rows={4}
                        placeholder="One item per line"
                        value={(sectionData[field.key] || []).join("\n")}
                        onChange={(e) => handleStringArrayChange(sectionKey, field.key, e.target.value)}
                      />
                    )}

                    {field.type === "array" && field.arrayFields && (
                      <div className="space-y-3">
                        {(sectionData[field.key] || []).map((item: any, idx: number) => (
                          <div key={idx} className="bg-secondary/30 rounded-lg p-3 flex gap-3 items-start">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {field.arrayFields!.map((af) => (
                                <div key={af.key}>
                                  <label className="text-[10px] text-muted-foreground">{af.label}</label>
                                  <input
                                    className={inputClass}
                                    value={item[af.key] || ""}
                                    onChange={(e) => handleArrayItemChange(sectionKey, field.key, idx, af.key, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => handleRemoveArrayItem(sectionKey, field.key, idx)}
                              className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md mt-4"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddArrayItem(sectionKey, field.key, field.arrayFields!)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add Item
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => handleSave(sectionKey)}
                  disabled={updateMutation.isPending}
                  className="bg-gradient-gold text-primary-foreground font-semibold py-2.5 px-6 rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminCmsEditor;
