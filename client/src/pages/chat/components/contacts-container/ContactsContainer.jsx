import { useEffect } from "react";
import NewDm from "./container/NewDm";
import ProfileInfo from "./container/ProfileInfo";
import { apiClient } from "@/lib/api-client";
import { GET_CHANNEL_ROUTES, GET_DM_CONTACTS_ROUTES } from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "@/components/ContactList";
import CreateChannel from "./container/CreateChannel";

const ContactsContainer = () => {
  const {
    setDirectMessageContacts,
    directMessageContacts,
    channels,
    setChannels,
  } = useAppStore();
  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await apiClient.get(GET_DM_CONTACTS_ROUTES, {
          withCredentials: true,
        });
        console.log("API Response:", response.data); // Debug API response
        if (response.data.contacts) {
          setDirectMessageContacts(response.data.contacts);
          console.log("Contacts set:", response.data.contacts); // Debug state update
        }
      } catch (error) {
        console.log("Error fetching contacts:", error); // Handle and log errors
      }
    };
    const getChannels = async () => {
      try {
        const response = await apiClient.get(GET_CHANNEL_ROUTES, {
          withCredentials: true,
        });
        console.log("API Response:", response.data); // Debug API response
        if (response.data.channels) {
          setChannels(response.data.channels);
          console.log("channels set:", response.data.contacts); // Debug state update
        }
      } catch (error) {
        console.log("Error fetching channels:", error); // Handle and log errors
      }
    };
    getContacts();
    getChannels();
  }, [setChannels, setDirectMessageContacts]); // This effect should only run once on mount

  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full ">
      <div className="pt-3 ">
        <Logo />
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Direct Message" />
          <NewDm />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={directMessageContacts} />
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="channels" />
          <CreateChannel />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={channels} isChannel={true} />
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
};

export default ContactsContainer;

const Logo = () => {
  return (
    <div className="flex p-5  justify-start items-center gap-2">
      <svg
        id="logo-38"
        width="78"
        height="32"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          className="ccustom"
          fill="#8338ec"
        ></path>{" "}
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          className="ccompli1"
          fill="#975aed"
        ></path>{" "}
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          className="ccompli2"
          fill="#a16ee8"
        ></path>{" "}
      </svg>
      <span className="text-3xl font-semibold ">Chat App</span>
    </div>
  );
};

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  );
};
