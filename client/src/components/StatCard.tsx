type StatCardProps = {
    label: string
    value: number | string
}

function StatCard({ label, value }: StatCardProps) {
    return (
        <div>
            <p className="text-s text-white font-bold mb-4">{label}</p>
            <p className="text-md text-gray-400">{value}</p>
        </div>
    )
}

export default StatCard