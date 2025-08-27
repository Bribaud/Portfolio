import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedAdmin } from '@/lib/auth'

// GET - Récupérer toutes les données du portfolio
export async function GET() {
  try {
    // Récupérer toutes les données nécessaires
    let profile = await prisma.profile.findFirst()
    let stats = await prisma.stat.findMany({ orderBy: { order: 'asc' } })
    let about = await prisma.aboutSection.findFirst()
    let projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: { order: 'asc' }
    })

    // Si pas de données, créer les données par défaut
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          greeting: "Hello, I am",
          name: "Naveen",
          title: "Data Scientist",
          bio: "Hello! I'm Naveen, a Data Scientist skilled in Machine Learning, Python, and SQL. I love turning complex data into clear insights that help solve real-world problems.",
          skills: ["MACHINE LEARNING", "PYTHON", "SQL", "NUMPY", "PANDAS"],
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
          resumeUrl: "#",
          linkedinUrl: "#",
          githubUrl: "#"
        }
      })
    }

    if (stats.length === 0) {
      const defaultStats = [
        { number: "1", label: "Python Project", icon: "🐍", background: "#3776ab", order: 1 },
        { number: "2", label: "ML Projects", icon: "🤖", background: "#ff6b6b", order: 2 },
        { number: "1", label: "SQL Project", icon: "🗃️", background: "#336791", order: 3 }
      ]
      await prisma.stat.createMany({ data: defaultStats })
      stats = await prisma.stat.findMany({ orderBy: { order: 'asc' } })
    }

    if (!about) {
      about = await prisma.aboutSection.create({
        data: {
          description: "Hello! I'm Naveen, a Data Scientist skilled in Machine Learning, Python, and SQL. I love turning complex data into clear insights that help solve real-world problems.",
          tools: [
            "🔹 I use Python to handle data and create models that learn from it.",
            "🔹 I'm good with SQL for organizing and retrieving data.",
            "🔹 I also work with tools like Jupyter Notebooks, Pandas, and Matplotlib."
          ],
          expertise: [
            "🔹 Building models that predict future trends and improve business decisions.",
            "🔹 Making data tasks faster and more accurate with automation.",
            "🔹 Designing easy-to-understand data visualizations for better decision-making."
          ],
          conclusion: "I believe in the power of learning from data and constantly improving. I enjoy sharing what I learn and connecting with others!"
        }
      })
    }

    if (projects.length === 0) {
      const defaultProjects = [
        {
          title: "AtliQ Hotels Data Analysis Project",
          domain: "Hospitality",
          badge: "Python Project",
          description: "AtliQ Grands faced declining market share due to a lack of data analytics capabilities. Tasked with analyzing historical data, I used Pandas in Jupyter Notebook for exploratory analysis, identifying crucial inefficiencies. The insights gained led to a 10% rise in occupancy rates and a 15% increase in satisfaction scores on key platforms.",
          details: "Situation: AtliQ Grands faced declining market share and revenue in a competitive sector without internal data analytics capabilities.\n\nTask: I was tasked to analyze historical data and derive insights to improve market position and revenue.\n\nAction: Using Pandas in Jupyter Notebook, I conducted exploratory data analysis to identify key performance trends and inefficiencies.\n\nResult: The insights led to a 10% increase in occupancy rates and a 15% improvement in satisfaction scores on major booking platforms.",
          cardGradient: "linear-gradient(45deg, #FFD700, #FFA500)",
          cardLabel: "HOTEL BOOKINGS",
          youtubeId: "xkx7hbKh6Ec",
          githubUrl: "#",
          images: [
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
          ],
          order: 1
        },
        {
          title: "Price Range Prediction",
          domain: "Food & Beverages",
          badge: "ML Project",
          description: "Develop a predictive model that will assist in finding a price range that avoids the risks of overpricing or underpricing the product based on various features.",
          details: "Situation: Need to develop an accurate pricing strategy for food & beverage products.\n\nTask: Create a machine learning model to predict optimal price ranges.\n\nAction: Implemented various ML algorithms and performed feature engineering.\n\nResult: Achieved high accuracy in price prediction, helping optimize pricing strategies.",
          cardGradient: "linear-gradient(45deg, #4169E1, #1E90FF)",
          cardLabel: "PRICE PREDICTION",
          githubUrl: "#",
          images: ["https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop"],
          order: 2
        },
        {
          title: "Healthcare Premium Prediction",
          domain: "Healthcare",
          badge: "ML Project",
          description: "Developed a high accuracy predictive model to estimate healthcare insurance premiums based on factors such as age, smoking habits, BMI, and other relevant variables.",
          details: "Situation: Healthcare insurance companies need accurate premium estimation.\n\nTask: Build a regression model to predict insurance premiums.\n\nAction: Used advanced regression techniques and feature selection.\n\nResult: Created a highly accurate model for premium prediction.",
          cardGradient: "linear-gradient(45deg, #87CEEB, #4682B4)",
          cardLabel: "HEALTHCARE PREDICTION",
          githubUrl: "#",
          images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop"],
          order: 3
        }
      ]
      await prisma.project.createMany({ data: defaultProjects })
      projects = await prisma.project.findMany({
        where: { published: true },
        orderBy: { order: 'asc' }
      })
    }

    return NextResponse.json({
      profile,
      stats,
      about,
      projects
    })
  } catch (error) {
    console.error('Erreur API portfolio:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour les données (admin uniquement)
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { type, data } = await request.json()

    switch (type) {
      case 'profile':
        await prisma.profile.upsert({
          where: { id: data.id || 'default' },
          create: data,
          update: data
        })
        break

      case 'stats':
        await prisma.stat.deleteMany()
        await prisma.stat.createMany({ data })
        break

      case 'about':
        await prisma.aboutSection.upsert({
          where: { id: data.id || 'default' },
          create: data,
          update: data
        })
        break

      case 'projects':
        // Logique de mise à jour des projets
        for (const project of data) {
          if (project.id) {
            await prisma.project.update({
              where: { id: project.id },
              data: project
            })
          } else {
            await prisma.project.create({ data: project })
          }
        }
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur PUT portfolio:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}