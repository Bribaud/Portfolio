'use client'

import { useState, useEffect } from 'react'
import { Github, Linkedin, ExternalLink, ArrowLeft } from 'lucide-react'
import { getVisitorId, getSessionId } from '@/lib/utils'

export default function PortfolioPage() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})
  const [portfolioData, setPortfolioData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/portfolio')
        const data = await response.json()
        setPortfolioData(data)

        // Tracker la visite
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: 'portfolio',
            visitorId: getVisitorId(),
            sessionId: getSessionId()
          })
        })
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const nextImage = (projectId) => {
    const project = portfolioData.projects.find(p => p.id === projectId)
    const current = currentImageIndex[projectId] || 0
    const next = (current + 1) % project.images.length
    setCurrentImageIndex(prev => ({ ...prev, [projectId]: next }))
  }

  const prevImage = (projectId) => {
    const project = portfolioData.projects.find(p => p.id === projectId)
    const current = currentImageIndex[projectId] || 0
    const prev = (current - 1 + project.images.length) % project.images.length
    setCurrentImageIndex(prev => ({ ...prev, [projectId]: prev }))
  }

  const handleProjectView = async (projectId) => {
    setSelectedProject(projectId)

    // Tracker la vue du projet
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'project_detail',
        projectId: projectId,
        visitorId: getVisitorId(),
        sessionId: getSessionId()
      })
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600">Impossible de charger les données du portfolio</p>
        </div>
      </div>
    )
  }

  const { profile, stats, about, projects } = portfolioData

  if (selectedProject) {
    const project = projects.find(p => p.id === selectedProject)
    const currentImg = currentImageIndex[project.id] || 0

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 mb-8 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au portfolio
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.title}</h1>
            <div className="flex justify-center items-center gap-4">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                {project.badge}
              </span>
              <span className="text-gray-600">Domaine: {project.domain}</span>
              <span className="text-gray-500">{project.viewCount} vues</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Résumé */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Résumé du Projet</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{project.description}</p>
              {project.githubUrl && project.githubUrl !== '#' && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  Voir le code
                </a>
              )}
            </div>

            {/* Images */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Version Finale du Projet</h2>
              {project.images && project.images.length > 0 ? (
                <div>
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={project.images[currentImg]}
                      alt={`Projet ${project.title}`}
                      className="w-full h-full object-cover"
                    />
                    {project.images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(project.id)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => nextImage(project.id)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                        >
                          →
                        </button>
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImg + 1} / {project.images.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <p className="text-gray-500">Aucune image disponible</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Détails */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Détails du Projet</h2>
              <div className="space-y-4">
                {project.details.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Vidéo */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Vidéo du Projet</h2>
              {project.youtubeId ? (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${project.youtubeId}`}
                    title="Vidéo du projet"
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Aucune vidéo disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Section héro */}
      <section className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="text-gray-600 text-xl italic">{profile.greeting}</div>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                {profile.name}
              </h1>
              <h2 className="text-2xl lg:text-3xl text-blue-600 font-medium">
                {profile.title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                {profile.bio}
              </p>
              <div className="flex items-center gap-4 pt-4">
                {profile.resumeUrl && profile.resumeUrl !== '#' && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-md transition-colors"
                  >
                    CV ↓
                  </a>
                )}
                <div className="flex items-center gap-3">
                  {profile.linkedinUrl && profile.linkedinUrl !== '#' && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile.githubUrl && profile.githubUrl !== '#' && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-900"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-blue-600 shadow-2xl">
                <img
                  src={profile.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"}
                  alt={`Photo de profil de ${profile.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-16">
              {stats.map((stat) => (
                <div key={stat.id} className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-medium text-white"
                    style={{ backgroundColor: stat.background }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              À propos <span className="text-blue-600">De moi</span>
            </h2>
          </div>

          <div className="space-y-12">
            <div className="text-center">
              <p className="text-lg text-gray-600 leading-relaxed">{about.description}</p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Outils et technologies:</h3>
              <ul className="space-y-3 text-gray-600">
                {about.tools.map((tool, index) => (
                  <li key={index}>{tool}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Domaines d'expertise:</h3>
              <ul className="space-y-3 text-gray-600">
                {about.expertise.map((exp, index) => (
                  <li key={index}>{exp}</li>
                ))}
              </ul>
            </div>

            <div className="text-center pt-8">
              <p className="text-lg text-gray-600 leading-relaxed italic">
                {about.conclusion}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compétences */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Compétences <span className="text-blue-600">Clés</span>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Projets */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mes <span className="text-blue-600">Projets</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div
                  className="h-40 flex items-center justify-center text-white font-bold text-xl"
                  style={{ background: project.cardGradient }}
                >
                  {project.cardLabel}
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {project.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-blue-600 text-sm mb-3 font-medium">
                    Domaine/Fonction: {project.domain}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {project.description.slice(0, 150)}...
                  </p>

                  <button
                    onClick={() => handleProjectView(project.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Voir Mon Travail
                  </button>

                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <span>{project.viewCount} vues</span>
                    <span className="text-green-500">
                      {project.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}