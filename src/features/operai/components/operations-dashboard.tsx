"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { DEMO_EXAMPLES, DEMO_REQUESTS } from "@/features/operai/data/demo";
import { MAX_INPUT_LENGTH } from "@/features/operai/lib/validation";
import { generateResponse, generateTask } from "@/features/operai/lib/workflows";
import type {
  OperationalRequest,
  ProcessResponse,
} from "@/features/operai/types/operational-request";
import { Icon } from "./icon";

export function OperationsDashboard() {
  const [input, setInput] = useState(DEMO_EXAMPLES[0].source);
  const [result, setResult] = useState<OperationalRequest | null>(null);
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("All requests");
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const pending = requests.filter((r) => r.status === "Review needed").length;
  const actionable = requests.filter(
    (r) => r.status !== "Review needed",
  ).length;
  const filtered = requests.filter(
    (r) =>
      (filter === "All requests" || r.status === filter) &&
      `${r.customer ?? ""} ${r.intent} ${r.source}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  async function processRequest(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    setDraft("");
    try {
      const response = await fetch("/api/operai/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = (await response.json()) as ProcessResponse & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error ?? "Unable to process this request.");
      setResult(data.request);
      setRequests((previous) => [data.request, ...previous]);
      setNotice(
        data.request.matchedExample
          ? "Demo example structured. Review the details below."
          : "Custom request captured. Demo mode cannot extract its details.",
      );
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Connection failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function updateStatus(status: "Saved" | "Task created") {
    if (!result) return;
    const updated = { ...result, status };
    setResult(updated);
    setRequests((previous) =>
      previous.map((item) => (item.id === result.id ? updated : item)),
    );
    setNotice(
      status === "Saved"
        ? "Request saved for this session. Refreshing clears your changes."
        : "Task file created. No external task system was updated.",
    );
  }

  function downloadTask() {
    if (!result) return;
    const url = URL.createObjectURL(
      new Blob([generateTask(result)], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `operai-task-${result.id}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    updateStatus("Task created");
  }

  function newRequest() {
    setInput("");
    setResult(null);
    setDraft("");
    setError("");
    setNotice("");
    inputRef.current?.focus();
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to workspace
      </a>
      <aside className="sidebar">
        <a href="#main" className="brand" aria-label="OPERAI home">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          OPERAI<span className="brand-dot">®</span>
        </a>
        <div className="workspace-label">
          <span className="workspace-avatar">O</span>
          <span>
            Operations workspace<small>Demo environment</small>
          </span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <a className="nav-item active" href="#main">
            <Icon name="grid" />
            Overview
            <span className="nav-indicator" />
          </a>
          <a className="nav-item" href="#recent">
            <Icon name="inbox" />
            Requests<span className="nav-count">{requests.length}</span>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-card">
            <span className="demo-badge">
              <span />
              DEMO MODE
            </span>
            <h3>
              A little clarity.
              <br />A lot less busywork.
            </h3>
            <p>
              Explore with sample requests.
              <br />
              No live AI is connected.
            </p>
          </div>
          <div className="workspace-footer">
            <span className="avatar">OP</span>
            <div>
              OPERAI<small>AI Operations Assistant</small>
            </div>
            <span className="version">v0.1</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <span className="mobile-brand">OPERAI / </span>Workspace{" "}
            <span className="breadcrumb">/</span>
            <strong>Overview</strong>
          </div>
          <span className="environment">
            <span />
            Demo environment
          </span>
        </header>
        <main id="main">
          <section className="page-heading">
            <div>
              <div className="eyebrow">LESS ADMIN. MORE MOMENTUM.</div>
              <h1>Operations, in order.</h1>
              <p>Turn everyday requests into clear next steps.</p>
            </div>
            <button
              className="button primary"
              onClick={newRequest}
              disabled={busy}
            >
              <Icon name="plus" />
              New request
            </button>
          </section>
          <section className="stats-grid" aria-label="Demo workspace summary">
            <article className="stat">
              <div className="stat-label">
                Requests in workspace
                <Icon name="inbox" />
              </div>
              <div className="stat-number">
                {String(requests.length).padStart(2, "0")}
                <span className="stat-pill">Demo data</span>
              </div>
              <p>Sample requests + this session</p>
              <div className="mini-bars" aria-hidden="true">
                {[30, 52, 41, 65, 48, 75, 59, 85, 65, 92, 79, 100].map(
                  (v, i) => (
                    <i key={i} style={{ height: `${v}%` }} />
                  ),
                )}
              </div>
            </article>
            <article className="stat">
              <div className="stat-label">
                Ready for review
                <Icon name="clock" />
              </div>
              <div className="stat-number">
                {String(pending).padStart(2, "0")}
                <span className="review-dots" aria-hidden="true">
                  •••
                </span>
              </div>
              <p>A human check before the next step</p>
              <div className="progress-track" aria-hidden="true">
                <span
                  style={{ width: `${(pending / requests.length) * 100}%` }}
                />
              </div>
            </article>
            <article className="stat">
              <div className="stat-label">
                Moved forward
                <Icon name="check" />
              </div>
              <div className="stat-number">
                {String(actionable).padStart(2, "0")}
                <span className="stat-caption">
                  / {String(requests.length).padStart(2, "0")} requests
                </span>
              </div>
              <p>Saved or turned into a task</p>
              <div className="segmented" aria-hidden="true">
                {requests.map((r) => (
                  <i
                    key={r.id}
                    className={r.status !== "Review needed" ? "filled" : ""}
                  />
                ))}
              </div>
            </article>
          </section>
          <section className="workspace-section" aria-labelledby="work-title">
            <div className="section-heading">
              <h2 id="work-title">From request to next step</h2>
              <span className="section-note">
                Your operational thinking space
              </span>
            </div>
            <div className="processing-grid">
              <form className="input-panel panel" onSubmit={processRequest}>
                <div className="panel-heading">
                  <span className="step">01</span>
                  <h3>The request</h3>
                  <span className="small-label">INPUT</span>
                </div>
                <label htmlFor="request-input">What needs to happen?</label>
                <p className="helper">
                  Paste a customer message, email, or operational note.
                </p>
                <textarea
                  ref={inputRef}
                  id="request-input"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError("");
                  }}
                  disabled={busy}
                  minLength={10}
                  maxLength={MAX_INPUT_LENGTH}
                  required
                  placeholder="A customer needs to change a delivery…"
                  aria-describedby="input-help input-count"
                />
                <div className="input-meta">
                  <span id="input-help">
                    Plain text · up to 2,000 characters
                  </span>
                  <span id="input-count">{input.length}/2,000</span>
                </div>
                <div className="examples">
                  <span>TRY AN EXAMPLE</span>
                  <div>
                    {DEMO_EXAMPLES.map((example, i) => (
                      <button
                        key={example.label}
                        type="button"
                        disabled={busy}
                        className={
                          input === example.source
                            ? "example selected"
                            : "example"
                        }
                        onClick={() => {
                          setInput(example.source);
                          setError("");
                        }}
                      >
                        <span>0{i + 1}</span>
                        {example.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="input-bottom">
                  <p>
                    <span className="demo-badge">DEMO MODE</span>Sample
                    matching, no live AI.
                  </p>
                  <button
                    className="button primary process-button"
                    disabled={busy || input.trim().length < 10}
                    type="submit"
                  >
                    <Icon name={busy ? "clock" : "spark"} />
                    {busy ? "Processing…" : "Structure request"}
                    <Icon name="arrow" />
                  </button>
                </div>
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
              </form>
              <section
                ref={resultRef}
                tabIndex={-1}
                className={`result-panel panel ${result ? "has-result" : ""}`}
                aria-labelledby="result-title"
                aria-busy={busy}
              >
                <div className="panel-heading">
                  <span className="step">02</span>
                  <h3 id="result-title">A clear next step</h3>
                  <span className="small-label">OUTPUT</span>
                </div>
                {result ? (
                  <>
                    <div className="result-intro">
                      <span className="result-icon">
                        <Icon name="check" />
                      </span>
                      <div>
                        <h4>
                          {result.matchedExample
                            ? "Request structured"
                            : "Manual review required"}
                        </h4>
                        <p>
                          {result.matchedExample
                            ? "Demo fixture · verify before taking action"
                            : "Custom text · extraction is not connected"}
                        </p>
                      </div>
                      <span className="demo-badge">DEMO</span>
                    </div>
                    <dl className="result-fields">
                      {[
                        ["Customer", result.customer],
                        ["Intent", result.intent],
                        ["Original date", result.originalDate],
                        ["Requested date", result.requestedDate],
                        ["Callback", result.callback],
                        [
                          "Priority",
                          result.matchedExample
                            ? result.priority
                            : "Needs review",
                        ],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd className={!value ? "missing" : ""}>
                            {label === "Priority" ? (
                              <span
                                className={`priority ${value === "High" ? "high" : ""}`}
                              >
                                <span />
                                {value}
                              </span>
                            ) : (
                              (value ??
                              (result.matchedExample
                                ? "Not specified"
                                : "Needs review"))
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="result-actions">
                      <button
                        className="button primary"
                        onClick={() => {
                          setDraft(generateResponse(result));
                          setNotice(
                            "Template response generated for your review. Nothing has been sent.",
                          );
                        }}
                      >
                        <Icon name="spark" />
                        Generate response
                      </button>
                      <button
                        className="button secondary"
                        onClick={downloadTask}
                      >
                        <Icon name="plus" />
                        Create task
                      </button>
                      <button
                        className="button text-button"
                        onClick={() => updateStatus("Saved")}
                        disabled={result.status === "Saved"}
                      >
                        <Icon
                          name={result.status === "Saved" ? "check" : "file"}
                        />
                        {result.status === "Saved" ? "Saved" : "Save request"}
                      </button>
                    </div>
                    <p className="result-footnote">
                      Actions stay local. Tasks download as text files.
                    </p>
                  </>
                ) : (
                  <div className="empty-result">
                    <div className="document-illustration">
                      <div className="paper">
                        <span />
                        <span />
                        <span />
                        <div>
                          <i />
                          <i />
                        </div>
                      </div>
                      <span className="floating-spark">
                        <Icon name="spark" size={22} />
                      </span>
                    </div>
                    <h4>Clarity starts here.</h4>
                    <p>
                      Structure a request to see the details,
                      <br />
                      then decide what happens next.
                    </p>
                    <div className="flow-label">
                      REQUEST <Icon name="arrow" size={14} /> STRUCTURE{" "}
                      <Icon name="arrow" size={14} /> ACTION
                    </div>
                  </div>
                )}
              </section>
            </div>
            <p className="notice" role="status" aria-live="polite">
              {notice ||
                "Demo workspace · fictional examples · session changes reset on refresh"}
            </p>
            {draft && (
              <section className="draft-panel panel">
                <div className="panel-heading">
                  <Icon name="file" />
                  <h3>Response draft</h3>
                  <span className="small-label">TEMPLATE · NOT SENT</span>
                </div>
                <label className="sr-only" htmlFor="response-draft">
                  Edit response draft
                </label>
                <textarea
                  id="response-draft"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="draft-footer">
                  <span>Review and edit before sharing.</span>
                  <button
                    className="button secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(draft);
                        setNotice("Response copied to clipboard.");
                      } catch {
                        setNotice(
                          "Clipboard unavailable. Select and copy the draft manually.",
                        );
                      }
                    }}
                  >
                    Copy response
                  </button>
                </div>
              </section>
            )}
          </section>
          <section
            id="recent"
            className="recent-section"
            aria-labelledby="recent-title"
          >
            <div className="section-heading">
              <div className="heading-inline">
                <h2 id="recent-title">Recent requests</h2>
                <span className="count-badge">{requests.length}</span>
              </div>
              <span className="section-note">
                Fictional samples & this session
              </span>
            </div>
            <div className="recent-panel panel">
              <div className="table-toolbar">
                <label className="sr-only" htmlFor="status-filter">
                  Filter by status
                </label>
                <select
                  id="status-filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {[
                    "All requests",
                    "Review needed",
                    "Saved",
                    "Task created",
                  ].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="search">
                  Search requests
                </label>
                <input
                  id="search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search requests…"
                />
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Customer / request</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Source</th>
                      <th>
                        <span className="sr-only">Open request</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div className="customer-cell">
                            <span className="customer-avatar">
                              {request.customer?.slice(0, 2).toUpperCase() ??
                                "—"}
                            </span>
                            <div>
                              <strong>
                                {request.customer ?? "Unassigned"}
                              </strong>
                              <span>{request.intent}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`priority ${request.priority === "High" ? "high" : ""}`}
                          >
                            <span />
                            {request.matchedExample
                              ? request.priority
                              : "Unreviewed"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status ${request.status === "Review needed" ? "review" : "saved"}`}
                          >
                            {request.status === "Review needed" ? (
                              <Icon name="clock" size={12} />
                            ) : (
                              <Icon name="check" size={12} />
                            )}{" "}
                            {request.status}
                          </span>
                        </td>
                        <td className="source-cell">
                          {request.id.startsWith("demo-")
                            ? "Demo sample"
                            : "This session"}
                        </td>
                        <td>
                          <button
                            className="open-request"
                            aria-label={`Open ${request.customer ?? "unassigned"} request`}
                            onClick={() => {
                              setResult(request);
                              setInput(request.source);
                              setDraft("");
                              setNotice("Request opened for review.");
                              resultRef.current?.focus();
                              resultRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                            }}
                          >
                            <Icon name="arrow" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="no-results">
                    No requests match. Try another search or status.
                  </div>
                )}
              </div>
              <div className="table-footer">
                <span>
                  {filtered.length} of {requests.length} requests
                </span>
                <span>
                  Session only <span className="tiny-dot">·</span> No database
                  connected
                </span>
              </div>
            </div>
          </section>
          <footer className="page-footer">
            <span>
              OPERAI <span>/</span> AI Operations Assistant
            </span>
          <Link href="/#projects">Back to portfolio ↗</Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
