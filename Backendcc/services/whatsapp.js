import dotenv from "dotenv";
import FormData from "form-data";
import fs from "fs";
dotenv.config();

export async function sendMessage(to, message, imageId = null) {
  try {
    let body;

    if (imageId) {
      body = {
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: {
          id: imageId,
          caption: message || "",
        },
      };
    } else {
      body = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    console.log("📩 WhatsApp FULL response:", JSON.stringify(data, null, 2));

    if (!response.ok || !data?.messages?.[0]?.id) {
      throw new Error(data?.error?.message || "WhatsApp send failed");
    }

    return data.messages[0].id;
  } catch (err) {
    console.error("❌ Media upload failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

export async function uploadMedia(filePath) {
  const formData = new FormData();

  formData.append("file", fs.createReadStream(filePath));
  formData.append("messaging_product", "whatsapp");

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/media`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      },
      body: formData,
    },
  );

  const data = await response.json();

  console.log("📤 Media upload response:", JSON.stringify(data, null, 2));

  if (!response.ok || !data.id) {
    throw new Error(data?.error?.message || "Media upload failed");
  }

  return data.id;
}
