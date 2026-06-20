// src/pages/TopicsPage.jsx

import { useEffect, useState, useCallback } from "react";
import {
  Plus, RefreshCw, AlertCircle, BookOpen, Search, Loader2,
} from "lucide-react";

import { getAllTopics, createTopic, updateTopic, deleteTopic } from "../services/topicService";
import TopicCard from "../components/topics/TopicCard";
import TopicModal from "../components/topics/TopicModal";
import DeleteConfirmModal from "../components/topics/DeleteConfirmModal";

// ── Skeleton card shown while loading ────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-gray-800" />
        <div className="w-6 h-6 rounded-lg bg-gray-800" />
      </div>
      <div className="space-y-2">
        <div className="w-3/4 h-4 rounded bg-gray-800" />
        <div className="w-full h-3 rounded bg-gray-800" />
        <div className="w-2/3 h-3 rounded bg-gray-800" />
      </div>
      <div className="w-full h-px bg-gray-800" />
      <div className="flex justify-between">
        <div className="w-12 h-3 rounded bg-gray-800" />
        <div className="w-20 h-3 rounded bg-gray-800" />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20
        flex items-center justify-center mb-5">
        <BookOpen className="w-7 h-7 text-violet-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No topics yet</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
        Topics help you organise your notes and study materials. Create your first one to get started.
      </p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl
          bg-gradient-to-r from-violet-600 to-indigo-600
          hover:from-violet-500 hover:to-indigo-500
          text-white text-sm font-semibold shadow-lg shadow-violet-600/20 transition-all"
      >
        <Plus className="w-4 h-4" /> Create first topic
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TopicsPage() {
  // List state
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Search (client-side filter — no extra API call needed)
  const [search, setSearch] = useState("");

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null); // null = create mode
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Fetch all topics ──────────────────────────────────────────────────────
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const data = await getAllTopics();
      // Accept both array response and { topics: [] } shaped response
      setTopics(Array.isArray(data) ? data : data.topics ?? []);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  // ── Create / Edit submit ──────────────────────────────────────────────────
  const handleModalSubmit = async (payload) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      if (editingTopic) {
        const updated = await updateTopic(editingTopic.id, payload);
        // Replace the old topic in list
        setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTopic(payload);
        setTopics((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete confirm ────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteTopic(deleteTarget.id);
      setTopics((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      closeDeleteModal();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openCreateModal = () => { setEditingTopic(null); setSubmitError(""); setModalOpen(true); };
  const openEditModal = (topic) => { setEditingTopic(topic); setSubmitError(""); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTopic(null); setSubmitError(""); };
  const openDeleteModal = (topic) => { setDeleteTarget(topic); setDeleteError(""); };
  const closeDeleteModal = () => { setDeleteTarget(null); setDeleteError(""); };

  // ── Client-side search filter ─────────────────────────────────────────────
  const filtered = topics.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 lg:p-10 space-y-8">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Topics</h1>
          <p className="text-sm text-gray-400">
            {loading ? "Loading…" : `${topics.length} topic${topics.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-gradient-to-r from-violet-600 to-indigo-600
            hover:from-violet-500 hover:to-indigo-500
            text-white text-sm font-semibold shadow-lg shadow-violet-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> New topic
        </button>
      </div>

      {/* ── Search bar (hidden while loading or empty) ── */}
      {!loading && !fetchError && topics.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800
              text-white text-sm placeholder-gray-600
              focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40
              transition-all"
          />
        </div>
      )}

      {/* ── Fetch error ── */}
      {fetchError && (
        <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Could not load topics</p>
            <p className="text-red-400/70 text-xs mt-0.5">{fetchError}</p>
          </div>
          <button
            onClick={fetchTopics}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300
              border border-red-500/30 rounded-lg px-3 py-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* ── Content area ── */}
      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state — no topics at all */}
      {!loading && !fetchError && topics.length === 0 && (
        <EmptyState onCreateClick={openCreateModal} />
      )}

      {/* No search results */}
      {!loading && !fetchError && topics.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <Search className="w-8 h-8 text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm">No topics match "{search}"</p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Topic cards grid */}
      {!loading && !fetchError && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit modal ── */}
      {modalOpen && (
        <TopicModal
          topic={editingTopic}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          submitting={submitting}
          error={submitError}
        />
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          topic={deleteTarget}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          deleting={deleting}
          error={deleteError}
        />
      )}

    </div>
  );
}