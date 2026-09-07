type StatCardProps = {
    label: string
    value: number | string
}

function StatCard({ label, value }: StatCardProps) {
    return (
        <div>
            <p className="text-xs text-gray-400 font-bold mb-2">{label}</p>
            <p className="text-xl text-white font-bold">{value}</p>
        </div>
    )
}

export default StatCard