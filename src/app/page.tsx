"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
	const tasks = useQuery(api.tasks.get);
	return (
		<div>
			<h1>Tasks</h1>
			<ul>
				{tasks?.map((task) => (
					<li key={task.text}>{task.text}</li>
				))}
			</ul>
		</div>
	);
}
