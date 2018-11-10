defmodule PortraitWeb.FramesChannel do
  use PortraitWeb, :channel

  # separate subtopic per browser
  def join("frames:" <> uuid, payload, socket) do
    IO.puts(uuid)
    {:ok, socket}
  end

  # poc immediate response
  def handle_in("frame_req", %{"frameId" => frameId, "frameContents" => frameContents} = payload, socket) do
    Task.async(fn -> process_frame(socket, payload) end)
    {:reply, {:ok, %{message: "thx hun"}}, socket}
  end

  def handle_in("frame_req", _payload, socket) do
    {:reply, {:error, %{message: "malformed payload"}}, socket}
  end

  # not sure why I need this to suppress warning messages
  def handle_info(_msg, state) do
    {:noreply, state}
  end

  # simulate API call
  defp process_frame(socket, payload) do
    Process.sleep(1000)
    broadcast(socket, "frame_resp", %{payload: payload, toast: true})
  end
end
