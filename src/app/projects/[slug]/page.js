import { notFound } from "next/navigation";
import projects, { getProject } from "@/data/projects";
import ProjectDetail from "@/components/ProjectDetail/ProjectDetail";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found — Griflan Labs" };
  return {
    title: `${project.title} — Griflan Labs`,
    description: `${project.tagline} ${project.category} identity, web and motion by Griflan Labs.`,
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}