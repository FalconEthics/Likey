<script>
	import { ExternalLink, Github, Linkedin, Instagram, Globe, AlertTriangle } from 'lucide-svelte';
	import LikeyLogo from '$lib/assets/Likey.png';
</script>

<svelte:head>
	<title>About - Likey</title>
	<meta name="description" content="About Likey - A modern social media platform project by Soumik Das" />
</svelte:head>

<div class="min-h-screen bg-base-100 px-4 py-8 pb-40">
	<div class="mx-auto max-w-4xl">
		<!-- Hero Section -->
		<div class="text-center mb-12">
			<div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
				<img src={LikeyLogo} alt="Likey" class="h-20 w-20 rounded-xl shadow-lg" />
			</div>
			<h1 class="likey-gradient-text mb-4 text-4xl font-bold">About Likey</h1>
			<p class="text-xl text-base-content/70 max-w-2xl mx-auto">
				A modern, production-ready Instagram-like social media platform built with cutting-edge web technologies
			</p>
		</div>

		<!-- Important Notice -->
		<div class="alert alert-warning mb-8">
			<AlertTriangle size={24} />
			<div>
				<h3 class="font-bold">Project Application Notice</h3>
				<div class="text-sm mt-1">
					This is a <strong>project application</strong> built for demonstration and portfolio purposes, not a production social media platform. Please do not share personal or sensitive information. Use responsibly and enjoy exploring the features!
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-2 gap-8">
			<!-- Project Information -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-2xl mb-4">Project Overview</h2>
					<div class="space-y-4">
						<p class="text-base-content/80">
							Likey is a modern social media platform that recreates the Instagram experience using the latest web technologies. Built with SvelteKit 5, Supabase, and modern design principles.
						</p>
						
						<div class="divider"></div>
						
						<h3 class="text-lg font-semibold mb-2">🚀 Key Features</h3>
						<ul class="space-y-2 text-sm">
							<li class="flex items-center">
								<span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
								Real-time social interactions (likes, comments, follows)
							</li>
							<li class="flex items-center">
								<span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
								Direct messaging with real-time updates
							</li>
							<li class="flex items-center">
								<span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
								Trending algorithm and user recommendations
							</li>
							<li class="flex items-center">
								<span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
								Advanced virtualization for performance
							</li>
							<li class="flex items-center">
								<span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
								Modern glassmorphism UI with dark mode
							</li>
							<li class="flex items-center">
								<span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
								Mobile-first responsive design
							</li>
						</ul>
						
						<div class="divider"></div>
						
						<h3 class="text-lg font-semibold mb-2">🛠️ Built With</h3>
						<div class="flex flex-wrap gap-2">
							<div class="badge badge-primary">SvelteKit 5</div>
							<div class="badge badge-secondary">Supabase</div>
							<div class="badge badge-accent">Tailwind CSS v4</div>
							<div class="badge badge-neutral">DaisyUI</div>
							<div class="badge badge-info">TanStack Virtual</div>
							<div class="badge badge-success">Bun</div>
							<div class="badge badge-warning">Vercel</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Developer Information -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-2xl mb-4">Developer</h2>
					<div class="space-y-4">
						<div class="text-center mb-6">
							<div class="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
								SD
							</div>
							<h3 class="text-xl font-bold">Soumik Das</h3>
							<p class="text-base-content/70">Full-Stack Developer</p>
						</div>
						
						<p class="text-base-content/80 text-sm text-center">
							Passionate about modern web technologies, real-time applications, and creating exceptional user experiences. This project demonstrates expertise in full-stack development with cutting-edge tools.
						</p>
						
						<div class="divider"></div>
						
						<div class="space-y-3">
							<a 
								href="https://www.linkedin.com/in/soumik-das-profile/" 
								target="_blank" 
								rel="noopener noreferrer"
								class="btn btn-outline w-full justify-start"
							>
								<Linkedin size={18} />
								LinkedIn Profile
								<ExternalLink size={16} class="ml-auto" />
							</a>
							
							<a 
								href="https://mrsoumikdas.com/" 
								target="_blank" 
								rel="noopener noreferrer"
								class="btn btn-outline w-full justify-start"
							>
								<Globe size={18} />
								Portfolio Website
								<ExternalLink size={16} class="ml-auto" />
							</a>
							
							<a 
								href="https://www.instagram.com/account.soumik.das/" 
								target="_blank" 
								rel="noopener noreferrer"
								class="btn btn-outline w-full justify-start"
							>
								<Instagram size={18} />
								Instagram Handle
								<ExternalLink size={16} class="ml-auto" />
							</a>
							
							<a 
								href="https://github.com/soumikdas/Likey" 
								target="_blank" 
								rel="noopener noreferrer"
								class="btn btn-outline w-full justify-start"
							>
								<Github size={18} />
								Project Repository
								<ExternalLink size={16} class="ml-auto" />
							</a>
							
							<a 
								href="https://github.com/FalconEthics" 
								target="_blank" 
								rel="noopener noreferrer"
								class="btn btn-outline w-full justify-start"
							>
								<Github size={18} />
								More Projects
								<ExternalLink size={16} class="ml-auto" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Technical Highlights -->
		<div class="card bg-base-200 shadow-xl mt-8">
			<div class="card-body">
				<h2 class="card-title text-2xl mb-4">🌟 Technical Highlights</h2>
				<div class="grid md:grid-cols-2 gap-6">
					<div>
						<h3 class="text-lg font-semibold mb-3 text-primary">Frontend Excellence</h3>
						<ul class="space-y-1 text-sm">
							<li>• SvelteKit 5 with modern runes syntax</li>
							<li>• Real-time updates and notifications</li>
							<li>• Advanced virtualization for performance</li>
							<li>• Mobile-first responsive design</li>
							<li>• Glassmorphism UI with smooth animations</li>
						</ul>
					</div>
					<div>
						<h3 class="text-lg font-semibold mb-3 text-secondary">Backend & Database</h3>
						<ul class="space-y-1 text-sm">
							<li>• Supabase PostgreSQL with Row Level Security</li>
							<li>• Real-time subscriptions for live updates</li>
							<li>• Secure authentication and file storage</li>
							<li>• Intelligent algorithms for trending content</li>
							<li>• Automated triggers and notifications</li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<!-- Live Demo -->
		<div class="text-center mt-8">
			<a 
				href="https://likey-social-media-app.vercel.app/" 
				target="_blank" 
				rel="noopener noreferrer"
				class="btn btn-primary btn-lg"
			>
				<ExternalLink size={20} />
				View Live Demo
			</a>
		</div>

		<!-- Copyright -->
		<footer class="mt-12 pt-8 border-t border-base-300">
			<div class="text-center text-base-content/60">
				<p class="text-sm">
					Copyright © 2025 - Soumik Das. All Rights Reserved.
				</p>
			</div>
		</footer>
	</div>
</div>
