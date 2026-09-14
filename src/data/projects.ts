export type FeatureStatus = "Implemented" | "In development" | "Planned" | null;
export type ProjectModule = { id: string; name: string; description: string; features: string[]; status: FeatureStatus };
// Completion has not been verified against the private application. Set status only from evidence.
export const businessModules: ProjectModule[] = [
  { id: "customers", name: "Customers", description: "The customer context behind each business workflow.", features: ["Customer records", "Notes", "Purchase history", "Operational information"], status: null },
  { id: "inventory", name: "Inventory", description: "Product information that feeds quotations and operational decisions.", features: ["Products", "Categories", "Images", "Stock information", "Search and filtering"], status: null },
  { id: "quotations", name: "Quotations", description: "The connection between a customer's needs and the products the business supplies.", features: ["Products from inventory", "Pricing", "Discounts", "Customer information", "Automatic numbering"], status: null },
  { id: "orders", name: "Supplier workflow", description: "Carry the commercial process into supplier coordination.", features: ["Supplier orders", "Commission documents", "Operational organization"], status: null },
  { id: "deliveries", name: "Deliveries", description: "Connect the order to the practical work of getting it to the customer.", features: ["Delivery scheduling", "Transport information", "Installation / delivery documentation"], status: null },
  { id: "documents", name: "Documents", description: "Turn business data into the documents the workflow needs.", features: ["PDF generation", "Pre-filled operational documents"], status: null },
  { id: "system", name: "System", description: "The shared application layer supporting connected workflows.", features: ["Authentication", "Multi-user architecture", "Cloud synchronization architecture"], status: null },
];
export type ProjectScreenshot = { id: string; label: string; src: string | null; alt: string };
// Add only real screenshots to public/projects/business-management, then set src below.
export const businessScreenshots: ProjectScreenshot[] = [
  { id: "dashboard", label: "Dashboard", src: null, alt: "Business Management System dashboard" },
  { id: "customers", label: "Customers", src: null, alt: "Customer records in the Business Management System" },
  { id: "inventory", label: "Inventory", src: null, alt: "Inventory in the Business Management System" },
  { id: "quotations", label: "Quotations", src: null, alt: "Quotations in the Business Management System" },
  { id: "orders", label: "Orders", src: null, alt: "Supplier orders in the Business Management System" },
  { id: "deliveries", label: "Deliveries", src: null, alt: "Delivery workflow in the Business Management System" },
  { id: "documents", label: "Documents", src: null, alt: "Operational documents in the Business Management System" },
];
export const businessProject = {
  name: "Business Management System",
  category: "Desktop business software",
  status: "Active development",
  context: "A desktop management application designed around the operational needs of a furniture business. It centralizes information and workflows that would otherwise be distributed across different processes.",
  technologies: ["Electron", "JavaScript", "Node.js", "SQLite", "HTML", "CSS", "Codex"],
  metadata: [["TYPE", "Desktop application"], ["STATUS", "Active development"], ["DATA", "SQLite"], ["RUNTIME", "Electron / Node.js"], ["DEVELOPMENT", "JavaScript + Codex"], ["SOURCE", "Private"]],
  story: [
    { title: "Problem", text: "Business information and operational workflows can become fragmented across customers, products, quotations, supplier orders and deliveries." },
    { title: "Objective", text: "Create one application capable of connecting those processes." },
    { title: "Solution", text: "A desktop management system built around the actual workflow of the business." },
  ],
};
export const futureProjects = [
  { number: "02", name: "AI Business Assistant", category: "AI application", status: "In development", description: "An AI-powered application designed to explore how small businesses can interact with operational information using natural language and automate repetitive tasks.", techLabel: "PLANNED TECHNOLOGY", technologies: ["Next.js", "TypeScript", "Node.js", "LLM API"] },
  { number: "03", name: "AI Workflow Automation", category: "Automation", status: "In development / exploration", description: "An exploration of intelligent workflows connecting APIs, webhooks and AI to process incoming business requests.", techLabel: "TECHNOLOGY BEING EXPLORED", technologies: ["n8n", "REST APIs", "Webhooks", "LLM"] },
];
