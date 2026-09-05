type RankedListProps<T> = {
    title: string
    items: T[]
    getLabel: (item: T) => string
}

function RankedList<T>({title, items, getLabel}: RankedListProps<T>) {
    return (
            <div className="flex flex-col items-center">
                <h2 className="text-lg font-bold mb-2">{title}</h2>
                {items.map((item, index) => (
                    <div key={index}>
                        <p>{getLabel(item)}</p>
                    </div>
                ))}
            </div>
    )
}

export default RankedList