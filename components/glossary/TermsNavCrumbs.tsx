import Link from "next/link";
import { RiHome3Line } from "react-icons/ri";

export default function TermsNavCrumbs({ term }) {
  return (
    <nav>
      <ul className="flex gap-x-8 mx-auto custom-container">
        <li className="flex gap-x-2 items-center py-2 flex-nowrap overflow-x-auto whitespace-nowrap">
          <Link
            href="/"
            className="font-semibold flex items-center  text-[18px] "
            style={{ minWidth: "fit-content" }}
          >
            <RiHome3Line />
            <span className="sr-only">Home</span>
          </Link>
          <Link
            href={"/glossaries"}
            className="font-semibold "
            style={{ minWidth: "fit-content" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4  inline"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
            <span className="first-letter:uppercase">Glossaries</span>
          </Link>
          {term.glossary && (
            <Link href={`/glossaries`} passHref className="font-semibold ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4  mx-0 inline"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
              {term.glossary.name}
            </Link>
          )}
          {term.parent && (
            <Link
              href={`/glossaries/${term.parent.fullyQualifiedName}`}
              className="font-semibold "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4  mx-0 inline"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
              {term.parent.name}
            </Link>
          )}
          <span className="font-semibold ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4  mx-0 inline"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
            {term.name}
          </span>
        </li>
      </ul>
    </nav>
  );
}
