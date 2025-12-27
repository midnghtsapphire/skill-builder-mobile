import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User auth error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { courseId } = await req.json();
    console.log("Generating certificate for user:", user.id, "course:", courseId);

    if (!courseId) {
      return new Response(JSON.stringify({ error: "Course ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      console.error("Course fetch error:", courseError);
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name || user.email?.split("@")[0] || "Student";

    // Check if user completed all lessons
    const { data: lessons } = await supabase
      .from("course_lessons")
      .select("id")
      .eq("course_id", courseId);

    const { data: progress } = await supabase
      .from("user_course_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .eq("completed", true);

    const completedLessonIds = progress?.map(p => p.lesson_id) || [];
    const allCompleted = lessons?.every(l => completedLessonIds.includes(l.id));

    if (!allCompleted) {
      console.log("User has not completed all lessons");
      return new Response(JSON.stringify({ error: "Course not completed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    let certificateNumber: string;
    let issuedAt: string;

    if (existingCert) {
      certificateNumber = existingCert.certificate_number;
      issuedAt = existingCert.issued_at;
      console.log("Using existing certificate:", certificateNumber);
    } else {
      // Generate certificate number
      certificateNumber = `SF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      issuedAt = new Date().toISOString();

      // Save certificate to database
      const { error: insertError } = await supabase
        .from("certificates")
        .insert({
          user_id: user.id,
          course_id: courseId,
          certificate_number: certificateNumber,
          issued_at: issuedAt,
        });

      if (insertError) {
        console.error("Certificate insert error:", insertError);
        return new Response(JSON.stringify({ error: "Failed to save certificate" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log("Created new certificate:", certificateNumber);
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([792, 612]); // Landscape letter
    const { width, height } = page.getSize();

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // Background color
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.98, 0.98, 0.98),
    });

    // Border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.85, 0.65, 0.13), // Gold
      borderWidth: 3,
    });

    // Inner border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: rgb(0.85, 0.65, 0.13),
      borderWidth: 1,
    });

    // Header
    page.drawText("CERTIFICATE OF COMPLETION", {
      x: width / 2 - 200,
      y: height - 100,
      size: 28,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Decorative line
    page.drawLine({
      start: { x: 150, y: height - 120 },
      end: { x: width - 150, y: height - 120 },
      thickness: 2,
      color: rgb(0.85, 0.65, 0.13),
    });

    // This certifies
    page.drawText("This is to certify that", {
      x: width / 2 - 80,
      y: height - 180,
      size: 14,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    // User name
    const nameWidth = helveticaBold.widthOfTextAtSize(userName, 36);
    page.drawText(userName, {
      x: width / 2 - nameWidth / 2,
      y: height - 230,
      size: 36,
      font: helveticaBold,
      color: rgb(0.15, 0.15, 0.15),
    });

    // Has successfully completed
    page.drawText("has successfully completed the course", {
      x: width / 2 - 130,
      y: height - 280,
      size: 14,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Course title
    const titleWidth = timesItalic.widthOfTextAtSize(course.title, 24);
    page.drawText(course.title, {
      x: width / 2 - titleWidth / 2,
      y: height - 330,
      size: 24,
      font: timesItalic,
      color: rgb(0.15, 0.15, 0.15),
    });

    // Category and difficulty
    const detailsText = `${course.category} • ${course.difficulty} Level`;
    const detailsWidth = helvetica.widthOfTextAtSize(detailsText, 12);
    page.drawText(detailsText, {
      x: width / 2 - detailsWidth / 2,
      y: height - 360,
      size: 12,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Date
    const dateText = `Issued on ${new Date(issuedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
    page.drawText(dateText, {
      x: width / 2 - 80,
      y: height - 420,
      size: 12,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Certificate number
    page.drawText(`Certificate No: ${certificateNumber}`, {
      x: width / 2 - 80,
      y: 60,
      size: 10,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });

    // SkillForge logo/text
    page.drawText("SkillForge", {
      x: width / 2 - 40,
      y: height - 480,
      size: 18,
      font: helveticaBold,
      color: rgb(0.85, 0.65, 0.13),
    });

    page.drawText("Professional Trade Training", {
      x: width / 2 - 70,
      y: height - 500,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    console.log("PDF generated successfully");

    return new Response(pdfBytes.buffer as ArrayBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SkillForge-Certificate-${course.title.replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});