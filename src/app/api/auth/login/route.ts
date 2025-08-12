import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    let user = await db.user?.findUnique({
      where: { email },
    });
    let staff: any = null;

    if (!user) {
      // Check if staff record exists
      staff = await db.staff.findFirst({
        where: { email },
        include: { restaurant: true },
      });

      if (!staff || !staff.isActive) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Use staff details to construct a user object for token generation
      user = {
        id: staff.userId,
        email: staff.email,
        name: staff.name,
      } as any;
    } else {
      // If user exists, check if a staff record exists.
      staff = await db.staff.findFirst({
        where: { userId: user?.id },
        include: { restaurant: true },
      });
    }

    // Check if user has an associated restaurant
    let restaurant: any = null;
    if (staff && staff.restaurant) {
      restaurant = staff.restaurant;
    } else if (user) {
      restaurant = await db.restaurant.findFirst({
        where: { ownerId: user?.id },
      });
    }

    if (!restaurant) {
      // If user doesn't own a restaurant, check if they are staff
      const staffRecord = await db.staff.findFirst({
        where: { email },
        include: {
          restaurant: true,
        },
      });

      if (!staffRecord || !staffRecord.isActive) {
        return NextResponse.json(
          { error: "No restaurant found for this user or account is inactive" },
          { status: 401 }
        );
      }

      // Verify password using staff record
      const isPasswordValid = await bcrypt.compare(
        password,
        staffRecord.password
      );
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = Buffer.from(
        JSON.stringify({
          userId: user?.id,
          restaurantId: staffRecord.restaurantId,
          email: user?.email,
          timestamp: Date.now(),
        })
      ).toString("base64");

      const response = {
        token,
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          restaurantId: staffRecord.restaurantId,
          role: staffRecord.role,
        },
        restaurant: {
          id: staffRecord.restaurant.id,
          name: staffRecord.restaurant.name,
          address: staffRecord.restaurant.address,
          phone: staffRecord.restaurant.phone,
          email: staffRecord.restaurant.email,
          gstNumber: staffRecord.restaurant.gstNumber,
        },
      };

      return NextResponse.json(response);
    }

    // For restaurant owners, check staff record for password
    const ownerStaff = await db.staff.findFirst({
      where: { userId: user?.id },
    });

    if (!ownerStaff || !ownerStaff.isActive) {
      return NextResponse.json(
        { error: "Staff account not found or inactive" },
        { status: 401 }
      );
    }

    // Verify password using staff record
    const isPasswordValid = await bcrypt.compare(password, ownerStaff.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = Buffer.from(
      JSON.stringify({
        userId: user?.id,
        restaurantId: restaurant.id,
        email: user?.email,
        timestamp: Date.now(),
      })
    ).toString("base64");

    // Get user's staff role if exists
    const staffWithRole = await db.staff.findFirst({
      where: { userId: user?.id },
      select: { role: true },
    });

    const response = {
      token,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        restaurantId: restaurant.id,
        role: staffWithRole?.role || "OWNER",
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        gstNumber: restaurant.gstNumber,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
