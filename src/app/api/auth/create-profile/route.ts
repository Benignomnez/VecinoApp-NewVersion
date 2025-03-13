import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Extract the profile data from the request
    const profileData = await request.json();

    console.log("Attempting to create profile with user ID:", profileData.id);

    // First, check if the profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileData.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error checking for existing profile:", fetchError);
      return NextResponse.json(
        { error: `Error checking profile: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (existingProfile) {
      console.log("Profile already exists, no need to create");
      return NextResponse.json({ success: true, profile: existingProfile });
    }

    // Create new profile
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: profileData.id,
        full_name: profileData.full_name,
        created_at: profileData.created_at || new Date().toISOString(),
        updated_at: profileData.updated_at || new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error inserting profile:", error);
      return NextResponse.json(
        { error: `Error creating profile: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("Profile created successfully");
    return NextResponse.json({ success: true, profile: data[0] });
  } catch (error: any) {
    console.error("Unexpected error in create-profile route:", error);
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
