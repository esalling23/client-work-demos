import { SCREEN_WIDTH } from "@/lib/constants/styles"
import { redirect } from "next/navigation"

const TooSmallScreen = () => {
	return (
		<div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm lg:flex">
			<h3>Woops! These games are only supported on screens wider than {SCREEN_WIDTH} pixels.</h3>
			<button 
				className="rounded bg-yellow-500 hover:bg-yellow-400 hover:scale-1.1 py-2 px-6"
				onClick={() => redirect('https://eronsalling.me/#/projects')}
			>Check out something else</button>
		</div>
	)
}

export default TooSmallScreen