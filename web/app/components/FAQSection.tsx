import { Accordion, Content, Tab, Trigger } from "./Accordion";

export const Faq = () => (
  <div
    className="flex flex-col items-center gap-5 w-full max-w-[850px] justify-center"
    id="faq"
  >
    <h1 className="font-semibold text-gray-700 text-3xl sm:text-4xl text-center">
      Frequently Asked Questions
    </h1>
    <div className="w-full">
      <Accordion>
        {questions.map((e, i) => {
          return (
            <Tab key={i}>
              <Trigger>{e.question}</Trigger>
              <Content>{e.answer}</Content>
            </Tab>
          );
        })}
      </Accordion>
    </div>
  </div>
);

const questions = [
  {
    question: "Who can benefit from InsightFlow ?",
    answer:
      "InsightFlow is designed for founders, product managers, and designers who want to streamline their user analysis process. It helps you spend less time sifting through data and more time building the next big thing.",
  },
  {
    question: "How are the personas generated ?",
    answer:
      "Personas are created using a clustering algorithm that works best with survey data containing demographic information. It groups similar customer segments, according to their demographics and responses, then uses an LLM to craft fictional personas based on these segments.",
  },
  {
    question: "Does it integrate directly with my feedback channels ?",
    answer:
      "Not yet. Currently, you’ll need to export your data as a CSV or PDF from your feedback channels and then upload it to InsightFlow.",
  },
  {
    question: "Is it available yet ?",
    answer:
      "Nah, We’re still working on the MVP and conducting customer development. If you’re excited about this, join our waitlist 🤩!",
  },
];
