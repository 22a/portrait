defmodule PortraitWeb.FramesChannel do
  use PortraitWeb, :channel

  # separate subtopic per browser
  def join("frames:" <> uuid, payload, socket) do
    IO.puts(uuid)
    {:ok, socket}
  end

  # poc immediate response
  def handle_in("ping", payload, socket) do
    Task.async(fn -> process_ping(socket) end)
    {:reply, :ok, socket}
  end

  # not sure why I need this to suppress warning messages
  def handle_info(_msg, state) do
    {:noreply, state}
  end

  # simulate API call
  defp process_ping(socket) do
    Process.sleep(1000)
    broadcast(socket, "pong", %{jeans: "on", toast: true})
  end
end
