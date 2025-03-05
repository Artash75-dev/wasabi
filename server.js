import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "querystring";
import dotenv from "dotenv";

dotenv.config();
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 9000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const courierLocations = {};

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Handle POST request for application/x-www-form-urlencoded content type
    if (
      req.method === "POST" &&
      req.headers["content-type"] === "application/x-www-form-urlencoded"
    ) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          // Parse the form data
          const parsedData = parse(body);

          // Emit the parsed data via Socket.IO, but only after a successful connection
          // if (io && parsedData.caller) {
          //   const userPhone = parsedData.caller.split("+")[1];
          //   const posterUser = await (
          //     await fetch(
          //       `https://joinposter.com/api/clients.getClients?${
          //         process.env.NEXT_PUBLIC_POSTER_TOKEN
          //       }&phone=${
          //         userPhone.length == 9 ? `998${userPhone}` : `${userPhone}`
          //       }`
          //     )
          //   ).json();
          //   if (posterUser?.response?.length > 0) {
          //     io.emit("phone", {
          //       clientId: posterUser?.response[0]?.client_id,
          //       phone: posterUser?.response[0]?.phone,
          //       phoneNumber: posterUser?.response[0]?.phone_number,
          //       has: true,
          //     });
          //   } else {
          //     io.emit("phone", {
          //       has: false,
          //     });
          //   }
          // }

          // Respond with a 200 status
          res.end(JSON.stringify({ message: "Success" }));
        } catch (error) {
          console.error("Error parsing body:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Something went wrong" }));
        }
      });
    } else {
      // Default Next.js request handler
      handler(req, res);
    }
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "*",
        "http://localhost:9000",
        "https://joinposter.com",
        "https://platform.joinposter.com",
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("connect " + socket.id);

    io.emit("getLocations", Object.values(courierLocations));

    socket.on("updateLocation", (data) => {
      const { lat, lng, deliver_id, name, email } = data;
      courierLocations[socket.id] = {
        deliver_id,
        lat,
        lng,
        id: socket.id,
        name,
        email,
      };
      io.emit("locationsUpdate", Object.values(courierLocations));
    });

    socket.on("disconnect", () => {
      delete courierLocations[socket.id];
      io.emit("locationsUpdate", Object.values(courierLocations));
    });

    socket.on("cancelSend", (data) => {
      io.emit("broadcast", data);
    });

    socket.on("order-status", (data) => {
      io.emit("order-details", data);
    });

    socket.on("order-finished", (data) => {
      io.emit("finished", data);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> hello Ready on http://${hostname}:${port}`);
    });
});

// import { createServer } from "node:http";
// import next from "next";
// import { Server } from "socket.io";

// const dev = process.env.NODE_ENV !== "production";
// const hostname = "localhost";
// const port = 9000;
// // when using middleware `hostname` and `port` must be provided below
// const app = next({ dev, hostname, port });
// const handler = app.getRequestHandler();

// app.prepare().then(() => {
//   const httpServer = createServer(handler);

//   // Initialize Socket.IO server with CORS configuration
//   const io = new Server(httpServer, {
//     cors: {
//       origin: [
//         "*",
//         "http://localhost:8080",
//         "https://joinposter.com",
//         "https://platform.joinposter.com",
//       ], // Allow all origins; replace with specific origins in production
//       methods: ["GET", "POST", "PUT", "DELETE"],
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("connect " + socket.id);
//     socket.on("cancelSend", (data) => {
//       io.emit("broadcast", data);
//     });

//     socket.on("order-status", (data) => {
//       io.emit("order-details", data);
//     });

//     socket.on("order-finished", (data) => {
//       io.emit("finished", data);
//     });
//   });

//   httpServer
//     .once("error", (err) => {
//       console.error(err);
//       process.exit(1);
//     })
//     .listen(port, () => {
//       console.log(`> Ready on http://${hostname}:${port}`);
//     });
// });
