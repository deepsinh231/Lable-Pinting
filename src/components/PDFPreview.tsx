"use client";
import { Product } from './LabelForm';

interface Props {
    data: Product[];
}

export default function PDFPreview({ data }: Props) {
    return (
        <div id="pdf-content">
            {data.map((item, idx) => (
                <div key={idx} className="label">
                    <div className="discount">{item.discount}</div>
                    <div className="product-name">{item.name}</div>
                    <div className="price-details">
                        MRP ₹{item.MRP} <br />
                        DMart Price ₹{item.SMP}
                    </div>
                </div>
            ))}
        </div>
    );
}
