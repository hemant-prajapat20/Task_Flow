import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreVertical, Edit2, Trash2, ArrowLeft, Calendar, Clock, AlertCircle, Filter, ArrowUpDown } from 'lucide-react';
import api from '../api/axios';
import TaskModal from '../components/TaskModal';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 shadow-sm' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/70 dark:border-blue-800/30 shadow-sm' },
  { id: 'done', title: 'Done', color: 'bg-green-50/80 dark:bg-green-900/20 border-green-200/70 dark:border-green-800/30 shadow-sm' }
];

const priorityColors = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
};

const BoardView = () => {
  const { id: boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState({ 'todo': [], 'in-progress': [], 'done': [] });
  const [isLoading, setIsLoading] = useState(true);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeColumnId, setActiveColumnId] = useState('todo');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('none');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [boardsRes, tasksRes] = await Promise.all([
        api.get('/boards'),
        api.get(`/tasks/board/${boardId}`)
      ]);
      
      const currentBoard = boardsRes.data.find(b => b._id === boardId);
      setBoard(currentBoard);

      const groupedTasks = { 'todo': [], 'in-progress': [], 'done': [] };
      tasksRes.data.forEach(task => {
        if (groupedTasks[task.status]) {
          groupedTasks[task.status].push(task);
        }
      });
      setTasks(groupedTasks);
    } catch (err) {
      console.error('Failed to fetch board data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [boardId]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
    
    const newTasks = { ...tasks };
    const sourceTasks = [...newTasks[sourceColumn]];
    const destTasks = sourceColumn === destColumn ? sourceTasks : [...newTasks[destColumn]];
    
    // Remove from source
    const [movedTask] = sourceTasks.splice(source.index, 1);
    
    // Add to destination
    destTasks.splice(destination.index, 0, movedTask);
    
    newTasks[sourceColumn] = sourceTasks;
    if (sourceColumn !== destColumn) {
      newTasks[destColumn] = destTasks;
    }
    
    // Optimistic UI update
    setTasks(newTasks);

    // If moved to a different column, update status in DB
    if (sourceColumn !== destColumn) {
      try {
        await api.put(`/tasks/${draggableId}`, { status: destColumn });
      } catch (err) {
        console.error('Failed to update task status:', err);
        // Revert on failure
        fetchData();
      }
    }
  };

  const openCreateTaskModal = (status) => {
    setEditingTask(null);
    setActiveColumnId(status);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskData);
      } else {
        await api.post(`/tasks/board/${boardId}`, { ...taskData, status: activeColumnId });
      }
      setIsTaskModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchData();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  const getFilteredAndSortedTasks = (columnId) => {
    let filtered = [...(tasks[columnId] || [])];
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    if (sortBy === 'earliest') {
      filtered.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortBy === 'latest') {
      filtered.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      });
    }

    return filtered;
  };

  const isDndDisabled = filterPriority !== 'all' || sortBy !== 'none';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Board not found</h2>
        <Link to="/" className="text-primary hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="py-2 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{board.title}</h1>
            {board.description && <p className="text-secondary text-sm truncate">{board.description}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
          <div className="flex-1 sm:flex-none flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 sm:px-3 py-1.5 shadow-sm min-w-0 overflow-hidden">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer w-full truncate"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div className="flex-1 sm:flex-none flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 sm:px-3 py-1.5 shadow-sm min-w-0 overflow-hidden">
            <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer w-full truncate"
            >
              <option value="none">Sort: Default</option>
              <option value="earliest">Due: Earliest First</option>
              <option value="latest">Due: Latest First</option>
            </select>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden w-full relative">
          <div className="flex gap-4 sm:gap-6 h-full pb-4 items-stretch min-w-max px-4 sm:px-6 lg:px-8">
            {COLUMNS.map((col) => (
              <div key={col.id} className={`w-[280px] sm:w-80 shrink-0 flex flex-col h-full rounded-xl border ${col.color}`}>
                <div className="p-4 flex justify-between items-center shrink-0 border-b border-inherit">
                  <h3 className="font-semibold flex items-center gap-2">
                    {col.title}
                    <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {tasks[col.id]?.length || 0}
                    </span>
                  </h3>
                  <button 
                    onClick={() => openCreateTaskModal(col.id)}
                    className="p-1 text-slate-500 hover:text-primary hover:bg-white/50 dark:hover:bg-slate-800/50 rounded transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto p-3 min-h-[150px] ${
                        snapshot.isDraggingOver ? 'bg-black/5 dark:bg-white/5' : ''
                      }`}
                    >
                      {getFilteredAndSortedTasks(col.id).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={isDndDisabled}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                              className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 group mb-3
                                ${snapshot.isDragging ? 'z-50 shadow-2xl ring-2 ring-primary ring-offset-1 dark:ring-offset-slate-900 cursor-grabbing' : 'hover:shadow-md hover:border-primary/30'}
                                ${isDndDisabled ? 'cursor-default' : 'cursor-grab'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className={`text-xs font-medium px-2 py-0.5 rounded uppercase tracking-wider ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </div>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openEditTaskModal(task)} className="p-1 text-slate-400 hover:text-primary rounded">
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteTask(task._id)} className="p-1 text-slate-400 hover:text-red-500 rounded">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                              
                              <h4 className="font-medium mb-1">{task.title}</h4>
                              {task.description && (
                                <p className="text-sm text-secondary line-clamp-2 mb-3">{task.description}</p>
                              )}
                              
                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                                {task.dueDate && (
                                  <div className={`flex items-center gap-1 font-medium ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {isOverdue(task.dueDate) && task.status !== 'done' ? <AlertCircle className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                )}
                                
                                {task.estimatedEffort && (
                                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    <Clock className="h-3 w-3" />
                                    {task.estimatedEffort}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                
                <div className="p-3 border-t border-inherit">
                  <button 
                    onClick={() => openCreateTaskModal(col.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors font-medium"
                  >
                    <Plus className="h-4 w-4" /> Add Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleTaskSubmit}
          task={editingTask}
          boardId={boardId}
        />
      )}
    </div>
  );
};

export default BoardView;
