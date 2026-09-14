type ContactDetails = {
  email: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  cvPath: string | null;
};

// Add your real details here. Null values render honest, disabled actions.
// Store your CV in public/cv/ and use a root-relative URL, e.g. /cv/your-file.pdf.
export const contactDetails: ContactDetails = {
  email: null,
  githubUrl: null,
  linkedinUrl: null,
  cvPath: null,
};
