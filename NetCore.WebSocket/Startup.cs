using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace NetCore.WebSocket
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(LogLevel.Debug);
            loggerFactory.AddDebug(LogLevel.Debug);
            if (env.IsDevelopment())
            {
                app.UseBrowserLink();
                app.UseDeveloperExceptionPage();

            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }
            var websocket = new WebSocketOptions
            {
                KeepAliveInterval = TimeSpan.FromSeconds(20),
                ReceiveBufferSize = 6 * 1024
            };
            app.UseWebSockets(websocket);
            app.Use(async (contex, next) =>
            {
                if (contex.Request.Path == "/ws")
                {
                    if (contex.WebSockets.IsWebSocketRequest)
                    {
                        var socket = await contex.WebSockets.AcceptWebSocketAsync();
                        await PingRequest(contex, socket);
                    }
                    else
                    {
                        contex.Response.StatusCode = 400;
                    }
                }
                else
                {
                    await next();
                }

            });

            app.UseStaticFiles();
            app.UseFileServer();
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }

        private async Task PingRequest(HttpContext contex, System.Net.WebSockets.WebSocket socket)
        {
            var buffer = new byte[6 * 1024];
            WebSocketReceiveResult resul =await socket.ReceiveAsync(new ArraySegment<byte>(buffer), System.Threading.CancellationToken.None);
            while(!resul.CloseStatus.HasValue){
                var datanya = System.Text.ASCIIEncoding.Default.GetString(buffer);
                var replay_="YourMessage=>"+datanya+"This From Server"+DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss");
                byte[] b= System.Text.ASCIIEncoding.Default.GetBytes(replay_);
                await socket.SendAsync(new ArraySegment<byte>(System.Text.ASCIIEncoding.Default.GetBytes(replay_), 0, b.Count()), resul.MessageType, resul.EndOfMessage, System.Threading.CancellationToken.None);
                resul = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), System.Threading.CancellationToken.None);
            }
            await socket.CloseAsync(resul.CloseStatus.Value, resul.CloseStatusDescription, System.Threading.CancellationToken.None);
        }
    }
}
