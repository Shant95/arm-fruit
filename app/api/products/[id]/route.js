import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        // 👇 Добавить await
        const { id } = await params;
        
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true
            }
        });
        
        if (!product) {
            return Response.json({ error: 'Товар не найден' }, { status: 404 });
        }
        
        return Response.json(product);
    } catch (error) {
        console.error('Ошибка GET /api/products/[id]:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}