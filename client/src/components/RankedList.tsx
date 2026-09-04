type RankedListProps<T> = {
    title: string
    items: T[]
    getLabel: (item: T) => string
}

function RankedList<T>({title, items, getLabel}: RankedListProps<T>) {
    return (
        <div className="min-h-screen bg-[#0B0D0C]">
            <div className="flex flex-col items-center">
                <h2>{title}</h2>
                {items.map((item, index) => (
                    <div key={index}>
                        <p>{getLabel(item)}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RankedList