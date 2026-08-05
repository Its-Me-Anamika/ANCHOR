import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Sparkles, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Task } from '../types';

type TaskFilter = 'all' | 'active' | 'completed';

export const TasksView: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useStore();

  const [inputVal, setInputVal] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    addTask(inputVal.trim());
    setInputVal('');
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = tasks.filter(t => !t.completed).length;

  // Group tasks by assigned date/createdAt
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const rawDateStr = task.date || (task.createdAt ? task.createdAt.slice(0, 10) : '');
    let dateKey = 'Other';

    if (rawDateStr) {
      const parts = rawDateStr.split('-').map(Number);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
        dateKey = dObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      }
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    const cleanTitle = task.text.startsWith('[Event] ') 
      ? task.text.replace('[Event] ', '') 
      : task.text;

    groups[dateKey].push({ ...task, text: cleanTitle });
    return groups;
  }, {} as Record<string, Task[]>);

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl cartoon-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-coral-500/20 border border-coral-500/30 flex items-center justify-center text-coral-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <span>Task Hub</span>
              <span className="text-xs bg-coral-500/20 text-coral-300 border border-coral-500/30 px-2 py-0.5 rounded-full font-bold">
                {activeCount} active
              </span>
            </h1>
            <p className="text-xs text-white/40">Organize your daily targets & boost your focus</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
          {(['all', 'active', 'completed'] as TaskFilter[]).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cartoon-btn ${
                filter === tab
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content: input + task list */}
      <div className="scrollable flex-1 flex flex-col min-h-0 pr-1">

      {/* Task Input */}
      <form onSubmit={handleSubmit} className="mb-6 relative">
        <input
          type="text"
          placeholder="Add a task and press Enter..."
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-12 text-base text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-coral-400 backdrop-blur-md transition-all shadow-xl font-medium"
        />
        <Plus className="w-5 h-5 text-coral-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-coral-500 hover:bg-coral-600 disabled:opacity-30 disabled:hover:bg-coral-500 text-white text-xs font-bold rounded-xl transition-all cartoon-btn"
        >
          Add Task
        </button>
      </form>

      {/* Grouped Tasks List */}
      <div className="flex-1 flex flex-col gap-5 pb-8">
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-white/30 bg-white/5 border border-white/10 rounded-2xl">
            <Sparkles className="w-8 h-8 mb-3 text-coral-400/50 animate-pulse" />
            <h3 className="text-base font-bold text-white/50">No tasks in this list</h3>
            <p className="text-xs mt-1">Add something meaningful to conquer today!</p>
          </div>
        ) : (
          Object.entries(groupedTasks).map(([dateLabel, groupList]) => (
            <div key={dateLabel} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1 text-xs font-extrabold text-sunshine-400 tracking-wider">
                <span>📅</span>
                <span>{dateLabel}</span>
                <div className="flex-1 h-[1px] bg-white/10 ml-2 rounded-full" />
              </div>
              {groupList.map(task => (
                <div
                  key={task.id}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cartoon-card ${
                    task.completed
                      ? 'bg-white/[0.02] border-white/5 text-white/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-5 h-5 rounded-lg border-white/20 text-coral-500 focus:ring-0 cursor-pointer accent-coral-500"
                    />
                    <span className={`text-sm md:text-base font-medium break-words leading-snug transition-all ${
                      task.completed ? 'line-through text-white/30' : 'text-white/90'
                    }`}>
                      {task.text}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl bg-coral-500/10 hover:bg-coral-500/30 text-coral-400 hover:text-coral-200 opacity-0 group-hover:opacity-100 transition-all cartoon-btn"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
        </div> {/* /scrollable */}
    </div>
    </div>
  );
};
