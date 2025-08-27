'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Plus, Trash2, Upload, Save, Eye, EyeOff, Edit2 } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics')
  const [analytics, setAnalytics] = useState(null)
  const [portfolioData, setPortfolioData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, portfolioRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/portfolio')
        ])

        if (analyticsRes.status === 401 || portfolioRes.status === 401) {
          router.push('/admin')
          return
        }

        const analyticsData = await analyticsRes.json()
        const portfolioData = await portfolioRes.json()

        setAnalytics(analyticsData)
        setPortfolioData(portfolioData)
      } catch (error) {
        console.error('Erreur chargement:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
  }

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  const saveData = async (type, data) => {
    setSaving(true)
    try {
      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      })

      if (response.ok) {
        showMessage('Données sauvegardées avec succès!')
        // Recharger les données
        const portfolioRes = await fetch('/api/portfolio')
        const portfolioData = await portfolioRes.json()
        setPortfolioData(portfolioData)
      } else {
        showMessage('Erreur lors de la sauvegarde', 'error')
      }
    } catch (error) {
      showMessage('Erreur de connexion', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Administration Portfolio</h1>
            <div className="flex items-center gap-4">
              {message && (
                <div className={`px-4 py-2 rounded ${message.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {message}
                </div>
              )}
              <a href="/" target="_blank" className="text-blue-600 hover:text-blue-700">
                Voir le portfolio →
              </a>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 mt-8 overflow-x-auto">
          {[
            { id: 'analytics', name: 'Analytics' },
            { id: 'profile', name: 'Profil' },
            { id: 'stats', name: 'Statistiques' },
            { id: 'about', name: 'À propos' },
            { id: 'skills', name: 'Compétences' },
            { id: 'projects', name: 'Projets' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 rounded-lg font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analytics' && <AnalyticsSection analytics={analytics} />}
        {activeTab === 'profile' && <ProfileEditor data={portfolioData?.profile} onSave={(data) => saveData('profile', data)} saving={saving} />}
        {activeTab === 'stats' && <StatsEditor data={portfolioData?.stats} onSave={(data) => saveData('stats', data)} saving={saving} />}
        {activeTab === 'about' && <AboutEditor data={portfolioData?.about} onSave={(data) => saveData('about', data)} saving={saving} />}
        {activeTab === 'skills' && <SkillsEditor data={portfolioData?.profile?.skills || []} onSave={(skills) => saveData('profile', {...portfolioData?.profile, skills})} saving={saving} />}
        {activeTab === 'projects' && <ProjectsEditor data={portfolioData?.projects || []} onSave={(data) => saveData('projects', data)} saving={saving} />}
      </div>
    </div>
  )
}

// Component Analytics (inchangé)
function AnalyticsSection({ analytics }) {
  if (!analytics) return <div>Chargement des analytics...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Analytics du Portfolio</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Visites totales</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalVisits}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Visiteurs uniques</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.uniqueVisitors}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pages vues</h3>
          <p className="text-3xl font-bold text-gray-900">
            {analytics.pageViews?.reduce((acc, p) => acc + p.views, 0) || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Sessions actives</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.recentSessions?.length || 0}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Projets les plus vus</h3>
        <div className="space-y-3">
          {analytics.projectViews?.slice(0, 5).map((project) => (
            <div key={project.id} className="flex justify-between items-center">
              <span className="text-gray-700">{project.title}</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {project.viewCount} vues
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Component Profile Editor
function ProfileEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState(data || {})
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (data) setFormData(data)
  }, [data])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const result = await response.json()

      if (result.success) {
        setFormData(prev => ({ ...prev, profileImage: result.url }))
      }
    } catch (error) {
      console.error('Erreur upload:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Éditer le profil</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Message d'accueil</label>
            <input
              type="text"
              value={formData.greeting || ''}
              onChange={(e) => setFormData({...formData, greeting: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Hello, I am"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Titre</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={formData.bio || ''}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image de profil</label>
          <div className="mt-1 flex items-center gap-4">
            {formData.profileImage && (
              <img src={formData.profileImage} alt="Profil" className="w-16 h-16 rounded-full object-cover" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <span className="text-blue-600">Upload...</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">URL LinkedIn</label>
            <input
              type="url"
              value={formData.linkedinUrl || ''}
              onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">URL GitHub</label>
            <input
              type="url"
              value={formData.githubUrl || ''}
              onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">URL du CV</label>
          <input
            type="url"
            value={formData.resumeUrl || ''}
            onChange={(e) => setFormData({...formData, resumeUrl: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}

// Component Stats Editor
function StatsEditor({ data, onSave, saving }) {
  const [stats, setStats] = useState(data || [])

  useEffect(() => {
    if (data) setStats(data)
  }, [data])

  const addStat = () => {
    setStats([...stats, {
      id: 'new-' + Date.now(),
      number: '0',
      label: 'Nouvelle stat',
      icon: '⭐',
      background: '#667eea',
      order: stats.length + 1
    }])
  }

  const updateStat = (index, field, value) => {
    const newStats = [...stats]
    newStats[index] = { ...newStats[index], [field]: value }
    setStats(newStats)
  }

  const removeStat = (index) => {
    setStats(stats.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gérer les statistiques</h2>
        <button
          onClick={addStat}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={stat.number}
                  onChange={(e) => updateStat(index, 'number', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Label</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Icône</label>
                <input
                  type="text"
                  value={stat.icon}
                  onChange={(e) => updateStat(index, 'icon', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Couleur</label>
                <input
                  type="color"
                  value={stat.background}
                  onChange={(e) => updateStat(index, 'background', e.target.value)}
                  className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm border"
                />
              </div>

              <button
                onClick={() => removeStat(index)}
                className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Prévisualisation */}
            <div className="mt-3 p-3 bg-gray-50 rounded flex items-center gap-3">
              <div
                className="w-10 h-10 rounded flex items-center justify-center text-white"
                style={{ backgroundColor: stat.background }}
              >
                {stat.icon}
              </div>
              <div>
                <div className="font-bold">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave(stats)}
        disabled={saving}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  )
}

// Component About Editor
function AboutEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState(data || {})

  useEffect(() => {
    if (data) setFormData(data)
  }, [data])

  const addTool = () => {
    setFormData(prev => ({
      ...prev,
      tools: [...(prev.tools || []), '🔹 Nouvel outil']
    }))
  }

  const updateTool = (index, value) => {
    const newTools = [...formData.tools]
    newTools[index] = value
    setFormData(prev => ({ ...prev, tools: newTools }))
  }

  const removeTool = (index) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index)
    }))
  }

  const addExpertise = () => {
    setFormData(prev => ({
      ...prev,
      expertise: [...(prev.expertise || []), '🔹 Nouvelle expertise']
    }))
  }

  const updateExpertise = (index, value) => {
    const newExpertise = [...formData.expertise]
    newExpertise[index] = value
    setFormData(prev => ({ ...prev, expertise: newExpertise }))
  }

  const removeExpertise = (index) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Éditer la section "À propos"</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Description principale</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Outils et technologies</label>
            <button
              onClick={addTool}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {(formData.tools || []).map((tool, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={tool}
                  onChange={(e) => updateTool(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
                <button
                  onClick={() => removeTool(index)}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Domaines d'expertise</label>
            <button
              onClick={addExpertise}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {(formData.expertise || []).map((exp, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={exp}
                  onChange={(e) => updateExpertise(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
                <button
                  onClick={() => removeExpertise(index)}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Conclusion</label>
          <textarea
            value={formData.conclusion || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, conclusion: e.target.value }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}

// Component Skills Editor
function SkillsEditor({ data, onSave, saving }) {
  const [skills, setSkills] = useState(data || [])
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    if (data) setSkills(data)
  }, [data])

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Gérer les compétences</h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nouvelle compétence"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
          <button
            onClick={addSkill}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded">
              <span className="font-medium text-blue-800">{skill}</span>
              <button
                onClick={() => removeSkill(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {skills.length === 0 && (
          <p className="text-gray-500 text-center py-8">Aucune compétence définie</p>
        )}

        <button
          onClick={() => onSave(skills)}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}

// Component Projects Editor
function ProjectsEditor({ data, onSave, saving }) {
  const [projects, setProjects] = useState(data || [])
  const [editingProject, setEditingProject] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (data) setProjects(data)
  }, [data])

  const createNewProject = () => {
    const newProject = {
      id: 'new-' + Date.now(),
      title: 'Nouveau Projet',
      domain: 'Domaine',
      badge: 'Badge',
      description: 'Description du projet',
      details: 'Détails du projet...',
      cardGradient: 'linear-gradient(45deg, #667eea, #764ba2)',
      cardLabel: 'NOUVEAU PROJET',
      youtubeId: '',
      githubUrl: '',
      images: [],
      published: true,
      viewCount: 0,
      order: projects.length + 1
    }
    setEditingProject(newProject)
    setShowForm(true)
  }

  const editProject = (project) => {
    setEditingProject({ ...project })
    setShowForm(true)
  }

  const saveProject = () => {
    if (editingProject.id.startsWith('new-')) {
      // Nouveau projet
      const newProjects = [...projects, { ...editingProject, id: Date.now().toString() }]
      setProjects(newProjects)
    } else {
      // Modifier projet existant
      const newProjects = projects.map(p =>
        p.id === editingProject.id ? editingProject : p
      )
      setProjects(newProjects)
    }
    setShowForm(false)
    setEditingProject(null)
  }

  const deleteProject = (projectId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      setProjects(projects.filter(p => p.id !== projectId))
    }
  }

  const togglePublished = (projectId) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, published: !p.published } : p
    ))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const result = await response.json()

        if (result.success) {
          setEditingProject(prev => ({
            ...prev,
            images: [...(prev.images || []), result.url]
          }))
        }
      } catch (error) {
        console.error('Erreur upload:', error)
      }
    }
  }

  const removeImage = (index) => {
    setEditingProject(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  if (showForm && editingProject) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {editingProject.id.startsWith('new-') ? 'Nouveau Projet' : 'Modifier le Projet'}
          </h2>
          <button
            onClick={() => { setShowForm(false); setEditingProject(null) }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titre</label>
              <input
                type="text"
                value={editingProject.title}
                onChange={(e) => setEditingProject(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Domaine</label>
              <input
                type="text"
                value={editingProject.domain}
                onChange={(e) => setEditingProject(prev => ({ ...prev, domain: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Badge</label>
              <input
                type="text"
                value={editingProject.badge}
                onChange={(e) => setEditingProject(prev => ({ ...prev, badge: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Label de carte</label>
              <input
                type="text"
                value={editingProject.cardLabel}
                onChange={(e) => setEditingProject(prev => ({ ...prev, cardLabel: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={editingProject.description}
              onChange={(e) => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Détails du projet</label>
            <textarea
              value={editingProject.details}
              onChange={(e) => setEditingProject(prev => ({ ...prev, details: e.target.value }))}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Utilisez le format STAR: Situation, Task, Action, Result"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">URL GitHub</label>
              <input
                type="url"
                value={editingProject.githubUrl || ''}
                onChange={(e) => setEditingProject(prev => ({ ...prev, githubUrl: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ID Vidéo YouTube</label>
              <input
                type="text"
                value={editingProject.youtubeId || ''}
                onChange={(e) => setEditingProject(prev => ({ ...prev, youtubeId: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                placeholder="Ex: dQw4w9WgXcQ"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gradient de la carte</label>
            <input
              type="text"
              value={editingProject.cardGradient}
              onChange={(e) => setEditingProject(prev => ({ ...prev, cardGradient: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Ex: linear-gradient(45deg, #FFD700, #FFA500)"
            />
            <div
              className="mt-2 h-20 rounded"
              style={{ background: editingProject.cardGradient }}
            ></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Images du projet</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {editingProject.images?.map((image, index) => (
                <div key={index} className="relative">
                  <img src={image} alt={`Projet ${index + 1}`} className="w-full h-24 object-cover rounded" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editingProject.published}
                onChange={(e) => setEditingProject(prev => ({ ...prev, published: e.target.checked }))}
                className="mr-2"
              />
              Projet publié
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={saveProject}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingProject(null) }}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gérer les projets</h2>
        <button
          onClick={createNewProject}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau Projet
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded flex items-center justify-center text-white font-bold text-xs"
                  style={{ background: project.cardGradient }}
                >
                  {project.cardLabel.slice(0, 10)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{project.title}</h3>
                  <p className="text-gray-600 text-sm">{project.domain} • {project.badge}</p>
                  <p className="text-gray-500 text-sm">{project.viewCount} vues</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublished(project.id)}
                  className={`p-2 rounded ${project.published ? 'text-green-600' : 'text-gray-400'}`}
                  title={project.published ? 'Publié' : 'Brouillon'}
                >
                  {project.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => editProject(project)}
                  className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-gray-500 text-center py-8">Aucun projet défini</p>
      )}

      <button
        onClick={() => onSave(projects)}
        disabled={saving}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Sauvegarde...' : 'Sauvegarder tous les projets'}
      </button>
    </div>
  )
}