const manager = await prisma.user.create({
    data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: 'manager',
        isActive: true,
        canViewDashboard: true,
        canViewOrders: body.canViewOrders || false,
        canManageOrders: body.canManageOrders || false,
        canViewProducts: body.canViewProducts || false,
        canManageProducts: body.canManageProducts || false,
        canViewCustomers: body.canViewCustomers || false,
        canManageCustomers: body.canManageCustomers || false,
    }
});