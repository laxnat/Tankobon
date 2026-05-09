// app/components/GenreChart.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface GenreEntry {
    genre: string;
    count: number;
}

const COLORS = [
    "#60a5fa", // blue-400
    "#34d399", // emerald-400                               
    "#a78bfa", // violet-400
    "#f87171", // red-400                                   
    "#facc15", // yellow-400                                
    "#fb923c", // orange-400
    "#e879f9", // fuchsia-400                               
    "#2dd4bf", // teal-400
];

export function GenreChart({ genres }: { genres: GenreEntry[] }) {
    // Display top 7 genres
    const TOP_N = 7;
    const top = genres.slice(0, TOP_N);
    const rest = genres.slice(TOP_N);
    const otherCount = rest.reduce((sum, g) => sum + g.count, 0);

    const data = [
        ...top.map((g) => ({ name: g.genre, value: g.count})),
        ...(otherCount > 0 ? [{ name: "Other", value: otherCount }] : []),
    ];

    if (data.length === 0 ) {
        return (
            <p className="text-white-purple text-center py-8">
                Add manga to see your genre breakdown.
            </p>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={115}
                    paddingAngle={3}                                
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell 
                            key={entry.name}
                            fill={index < TOP_N ? COLORS[index % COLORS.length] : "#475569"}
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#1e2a3a",
                        border: "1px solid rgba(255,255,255,0.1)",    
                        borderRadius: "8px",
                        color: "#fff",  
                    }}
                    formatter={(value, name) => [`${value} manga`, name]}                                 
                />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (                         
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>{value}</span>                                  
                    )}   
                />
            </PieChart>
        </ResponsiveContainer>
    )
}