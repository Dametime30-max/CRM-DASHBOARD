/**
 * DEFAULT checklist template — used ONCE to seed an empty database.
 *
 * After seeding, the template lives in the database and is edited through the
 * app (Settings → Checklist template). Editing this file does not change an
 * existing database.
 *
 * Guidance text is deliberately phrased as prompts ("consider", "confirm",
 * "check against firm precedent") and is NOT legal advice. It does not replace
 * the firm's precedents, procedures or supervision. Adjust to your firm's
 * practice.
 */

export interface TemplateSeedItem {
  label: string;
  guidance?: string;
}

export interface TemplateSeedStage {
  name: string;
  description: string;
  items: TemplateSeedItem[];
}

export const DEFAULT_TEMPLATE: TemplateSeedStage[] = [
  {
    name: "Initial Instructions",
    description: "Take and record the client's instructions and identify issues early.",
    items: [
      { label: "Open/create matter", guidance: "Complete conflict check and matter opening per firm procedure." },
      { label: "Confirm client identity", guidance: "Verify identity per firm ID/verification procedure and record the documents sighted." },
      { label: "Confirm instructions are for a new Will or review", guidance: "Record whether this is a new Will or a review/update of an existing Will." },
      { label: "Record date of instructions" },
      { label: "Obtain existing Will", guidance: "Locate any existing Will (and any codicils). Note who holds the original." },
      { label: "Identify spouse/partner", guidance: "Include marital/domestic partnership status and any separation or pending proceedings." },
      { label: "Identify children", guidance: "Include children of previous relationships, stepchildren and any adopted children." },
      { label: "Identify other relevant family members", guidance: "Anyone who may be dependent on the client or may expect provision." },
      { label: "Identify intended executors" },
      { label: "Identify substitute executors" },
      { label: "Identify beneficiaries" },
      { label: "Identify specific gifts", guidance: "Particular items, amounts or property to specific people or organisations." },
      { label: "Identify intended residue beneficiaries" },
      { label: "Identify unequal distributions", guidance: "Record the client's reasons if they are comfortable providing them." },
      { label: "Identify loans/advancements", guidance: "Loans or advances to family members and whether they are to be taken into account." },
      { label: "Identify relevant family provision issues", guidance: "Note anyone who may have a potential claim. Discuss with supervising lawyer where relevant." },
      { label: "Consider testamentary capacity", guidance: "Note any concerns (age, illness, medication, cognitive issues). Follow firm procedure and escalate if in doubt." },
      { label: "Identify unusual circumstances requiring further advice/supervision", guidance: "E.g. possible undue influence, overseas assets, complex structures, vulnerable client." },
    ],
  },
  {
    name: "Asset / Estate Review",
    description: "Understand what the client owns and what passes under the Will versus outside it. Use item notes to record details.",
    items: [
      { label: "Principal residence", guidance: "Record title details and how it is held (sole name / joint tenants / tenants in common)." },
      { label: "Other real property", guidance: "Include investment and overseas property. Note ownership structure." },
      { label: "Jointly owned property", guidance: "Assets held as joint tenants may pass by survivorship outside the estate." },
      { label: "Bank accounts" },
      { label: "Shares/investments" },
      { label: "Vehicles" },
      { label: "Personal property", guidance: "Items of significant financial or sentimental value." },
      { label: "Businesses" },
      { label: "Company interests", guidance: "Shareholdings, directorships, constitution and any shareholder agreement." },
      { label: "Trust interests", guidance: "Family/discretionary trusts: role (appointor, trustee, beneficiary) and the trust deed." },
      { label: "Superannuation", guidance: "Superannuation does not automatically form part of the estate. Record fund details." },
      { label: "Binding death benefit nominations", guidance: "Obtain copies of any nominations and note validity/expiry dates." },
      { label: "Life insurance", guidance: "Note whether held inside or outside super and any nominated beneficiary." },
      { label: "Loans owed to client" },
      { label: "Loans owed by client" },
      { label: "Digital assets", guidance: "Online accounts, cryptocurrency, digital records." },
      { label: "Other significant assets" },
    ],
  },
  {
    name: "Estate Planning / Advice",
    description: "Work through the planning issues with the client. Escalate to a senior lawyer where required.",
    items: [
      { label: "Confirm proposed distribution" },
      { label: "Confirm executor structure" },
      { label: "Consider substitute executor provisions" },
      { label: "Consider survivorship provisions" },
      { label: "Consider specific gifts" },
      { label: "Consider residue" },
      { label: "Consider minor beneficiaries", guidance: "How gifts to beneficiaries under age are to be held and managed." },
      { label: "Consider testamentary trust provisions", guidance: "Check against firm precedent and seek supervision where required." },
      { label: "Consider guardianship provisions", guidance: "Where the client has minor children." },
      { label: "Consider family provision risks", guidance: "Discuss with supervising lawyer and consider documenting the client's reasons." },
      { label: "Consider jointly held assets" },
      { label: "Consider assets passing outside estate", guidance: "E.g. jointly held property, superannuation, some insurance, trust and company assets." },
      { label: "Consider superannuation nominations" },
      { label: "Consider company/trust succession issues", guidance: "Control of companies and trusts may need separate documents (e.g. deed variations)." },
      { label: "Identify matters requiring senior lawyer review" },
    ],
  },
  {
    name: "Drafting",
    description: "Prepare and check the draft Will using the firm's precedents.",
    items: [
      { label: "Select appropriate precedent", guidance: "Use the firm's current approved precedent." },
      { label: "Prepare first draft" },
      { label: "Check client names/details" },
      { label: "Check revocation clause" },
      { label: "Check executor appointments" },
      { label: "Check substitute executor appointments" },
      { label: "Check funeral wishes" },
      { label: "Check specific gifts" },
      { label: "Check residue" },
      { label: "Check survivorship" },
      { label: "Check beneficiary substitution" },
      { label: "Check minor beneficiary provisions" },
      { label: "Check testamentary trust provisions" },
      { label: "Check guardianship provisions" },
      { label: "Check administrative provisions" },
      { label: "Check consistency throughout document" },
      { label: "Check defined terms" },
      { label: "Conduct final drafting review", guidance: "Including supervising lawyer review where required by firm procedure." },
      { label: "Save correct draft version", guidance: "Save to the firm's document management system with the correct version number." },
    ],
  },
  {
    name: "Client Review",
    description: "Send the draft to the client and settle any amendments.",
    items: [
      { label: "Send draft to client" },
      { label: "Record client comments" },
      { label: "Review requested amendments" },
      { label: "Update draft" },
      { label: "Confirm instructions" },
      { label: "Send revised draft" },
      { label: "Confirm final approval" },
    ],
  },
  {
    name: "Execution",
    description: "Arrange and supervise signing in accordance with the firm's execution procedure.",
    items: [
      { label: "Prepare final execution version" },
      { label: "Confirm execution arrangements", guidance: "In person or other arrangement permitted by law and firm procedure." },
      { label: "Confirm witnesses", guidance: "Check witness eligibility (e.g. not a beneficiary or beneficiary's spouse/partner) per firm procedure." },
      { label: "Arrange signing appointment" },
      { label: "Check all pages" },
      { label: "Check signatures" },
      { label: "Check witnessing" },
      { label: "Record execution date" },
      { label: "Save executed Will", guidance: "Save a scanned copy of the executed Will to the matter." },
      { label: "Confirm original Will storage", guidance: "Safe custody with the firm or client — record where the original is held." },
    ],
  },
  {
    name: "Post-Execution",
    description: "Complete follow-up and close the matter.",
    items: [
      { label: "Provide copy to client" },
      { label: "Confirm original storage", guidance: "Update the safe custody register if held by the firm." },
      { label: "Update matter records" },
      { label: "Record relevant follow-up matters" },
      { label: "Consider BDBN follow-up", guidance: "Whether any binding death benefit nominations need to be made or renewed." },
      { label: "Consider title/ownership follow-up", guidance: "E.g. severance of joint tenancy, if instructed." },
      { label: "Consider trust/company follow-up" },
      { label: "Set future Will review reminder", guidance: "E.g. on major life events or after a set period." },
      { label: "Close matter", guidance: "Per firm file closing procedure." },
    ],
  },
];
